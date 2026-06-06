import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken, getAuthUserId } from "@/lib/auth";
import {
  getCachedConversation,
  getConversation,
  getConversationMessages,
  tailorDisplayName,
} from "@/lib/chat/api";
import { getPendingOrder, clearPendingOrder } from "@/lib/chat/orderRequest";
import { chatSocket } from "@/lib/chat/socket";
import type { ChatConversation, ChatMessage, ChatReplyTo } from "@/lib/chat/types";
import { ChatApiError, ChatUnauthorizedError } from "@/lib/chat/types";

export interface DisplayMessage extends ChatMessage {
  isOwn: boolean;
  pending?: boolean;
}

function enrichMessage(msg: ChatMessage, userId: string | null): DisplayMessage {
  return {
    ...msg,
    isOwn: Boolean(userId && msg.senderUserId === userId) || msg.id.startsWith("pending-"),
    pending: msg.id.startsWith("pending-"),
  };
}

interface UseConversationChatResult {
  conversation: ChatConversation | null;
  messages: DisplayMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  unauthorized: boolean;
  toast: string | null;
  sendMessage: (body: string, replyToMessageId?: string, replyTo?: ChatReplyTo | null) => void;
  loadOlder: () => void;
  clearToast: () => void;
}

export function useConversationChat(conversationId: string): UseConversationChatResult {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authVersion, setAuthVersion] = useState(0);
  const messageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onAuthChanged = () => setAuthVersion((v) => v + 1);
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  const replaceMessages = useCallback((incoming: ChatMessage[]) => {
    const userId = getAuthUserId();
    messageIdsRef.current = new Set();
    const next: DisplayMessage[] = [];

    for (const msg of incoming) {
      messageIdsRef.current.add(msg.id);
      next.push(enrichMessage(msg, userId));
    }

    if (next.length === 0) {
      const pending = getPendingOrder(conversationId);
      if (pending) {
        messageIdsRef.current.add(pending.id);
        next.push(enrichMessage(pending, userId));
      }
    }

    next.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setMessages(next);
  }, [conversationId]);

  const appendUnique = useCallback((incoming: ChatMessage[]) => {
    const userId = getAuthUserId();
    setMessages((prev) => {
      const next = prev.filter((msg) => !msg.pending);
      messageIdsRef.current = new Set(next.map((msg) => msg.id));

      for (const msg of incoming) {
        if (messageIdsRef.current.has(msg.id)) continue;
        messageIdsRef.current.add(msg.id);
        next.push(enrichMessage(msg, userId));
        if (msg.type === "ORDER_REQUEST" && msg.orderId) {
          clearPendingOrder(conversationId);
        }
      }

      next.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return next;
    });
  }, [conversationId]);

  const prependUnique = useCallback((older: ChatMessage[]) => {
    const userId = getAuthUserId();
    setMessages((prev) => {
      const added: DisplayMessage[] = [];
      for (const msg of older) {
        if (messageIdsRef.current.has(msg.id)) continue;
        messageIdsRef.current.add(msg.id);
        added.push(enrichMessage(msg, userId));
      }
      const merged = [...added, ...prev.filter((msg) => !msg.pending)];
      merged.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return merged;
    });
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      setUnauthorized(true);
      setLoading(false);
      setConversation(getCachedConversation(conversationId));
      return;
    }

    setUnauthorized(false);
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const cached = getCachedConversation(conversationId);
        if (cached) setConversation(cached);

        const conv = (await getConversation(conversationId)) ?? cached;
        if (conv && !cancelled) setConversation(conv);

        const page = await getConversationMessages(conversationId, { limit: 50 });
        if (cancelled) return;

        replaceMessages(page.messages);
        setHasMore(page.hasMore);
        setCursor(page.messages[0]?.id ?? page.nextCursor ?? null);

        if (page.messages.length === 0 && getPendingOrder(conversationId)) {
          window.setTimeout(async () => {
            if (cancelled) return;
            try {
              const retry = await getConversationMessages(conversationId, { limit: 50 });
              if (cancelled || retry.messages.length === 0) return;
              replaceMessages(retry.messages);
              setHasMore(retry.hasMore);
              setCursor(retry.messages[0]?.id ?? retry.nextCursor ?? null);
            } catch {
              /* keep pending placeholder */
            }
          }, 800);
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ChatUnauthorizedError) {
          setUnauthorized(true);
        } else if (e instanceof ChatApiError && (e.status === 403 || e.status === 404)) {
          setError(e.message);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load chat");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId, authVersion, replaceMessages]);

  useEffect(() => {
    if (!getAccessToken() || error) return;

    try {
      chatSocket.connect();
    } catch {
      setUnauthorized(true);
      return;
    }

    chatSocket.joinConversation(conversationId);

    const offMsg = chatSocket.onMessage((msg) => {
      if (msg.conversationId !== conversationId) return;
      appendUnique([msg]);
    });

    const offErr = chatSocket.onError((payload) => {
      const msg = payload.message ?? "Chat error";
      setToast(msg);
      if (payload.code === "UNAUTHORIZED") setUnauthorized(true);
    });

    return () => {
      chatSocket.leaveConversation(conversationId);
      offMsg();
      offErr();
    };
  }, [conversationId, appendUnique, error, authVersion]);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const page = await getConversationMessages(conversationId, {
        limit: 50,
        cursor,
      });
      prependUnique(page.messages);
      setHasMore(page.hasMore);
      setCursor(page.messages[0]?.id ?? page.nextCursor ?? null);
    } catch (e) {
      if (e instanceof ChatUnauthorizedError) setUnauthorized(true);
      else setToast(e instanceof Error ? e.message : "Could not load older messages");
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, cursor, hasMore, loadingMore, prependUnique]);

  const sendMessage = useCallback(
    (body: string, replyToMessageId?: string, replyTo?: ChatReplyTo | null) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      if (trimmed.length > 4000) {
        setToast("Message is too long (max 4000 characters).");
        return;
      }

      const userId = getAuthUserId();
      const optimisticId = `pending-send-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        conversationId,
        senderUserId: userId ?? "local-user",
        type: "TEXT",
        body: trimmed,
        description: null,
        category: null,
        orderTypes: [],
        imageUrls: [],
        attachments: [],
        measurements: [],
        addons: [],
        requiredBy: null,
        orderId: null,
        createdAt: new Date().toISOString(),
        replyToMessageId: replyToMessageId ?? null,
        replyTo: replyTo ?? null,
      };

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== optimisticId),
        enrichMessage(optimistic, userId),
      ]);
      messageIdsRef.current.add(optimisticId);

      chatSocket
        .sendTextMessage(conversationId, trimmed, replyToMessageId)
        .then((ack) => {
          if (!ack?.ok) {
            setToast(ack?.error?.message ?? "Send failed");
          }
        })
        .catch(() => setUnauthorized(true));
    },
    [conversationId]
  );

  return {
    conversation,
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    unauthorized,
    toast,
    sendMessage,
    loadOlder,
    clearToast: () => setToast(null),
  };
}

export function getTailorName(conversation: ChatConversation | null): string {
  return tailorDisplayName(conversation?.tailor);
}
