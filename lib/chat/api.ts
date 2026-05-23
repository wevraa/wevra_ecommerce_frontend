import { getAccessToken, tryRefreshFromStorage } from "@/lib/auth";
import type {
  ChatConversation,
  ChatMessagesResponse,
  ChatUser,
} from "./types";
import { ChatApiError, ChatUnauthorizedError } from "./types";
import {
  normalizeConversationList,
  normalizeConversationResponse,
  normalizeMessagesResponse,
} from "./normalize";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

/** Socket host — same origin as API without `/api` suffix. */
export function getApiHost(): string {
  const envHost = process.env.NEXT_PUBLIC_API_HOST;
  if (envHost) return envHost.replace(/\/$/, "");
  return API_BASE.replace(/\/api\/?$/, "");
}

async function chatFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new ChatUnauthorizedError();
  }

  const res = await fetch(`${API_BASE}/v1/chat${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshFromStorage();
    if (refreshed) return chatFetch<T>(path, init, false);
    throw new ChatUnauthorizedError();
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `Request failed (${res.status})`;
    if (res.status === 401) throw new ChatUnauthorizedError(msg);
    throw new ChatApiError(msg, res.status, data?.code);
  }

  return data as T;
}

export async function createConversation(tailorId: string): Promise<ChatConversation> {
  const data = await chatFetch<unknown>("/conversations", {
    method: "POST",
    body: JSON.stringify({ tailorId }),
  });
  const conversation = normalizeConversationResponse(data);
  if (!conversation) {
    throw new ChatApiError("Invalid conversation response", 500);
  }
  return conversation;
}

export async function listConversations(): Promise<ChatConversation[]> {
  const data = await chatFetch<unknown>("/conversations");
  return normalizeConversationList(data);
}

export async function getConversation(conversationId: string): Promise<ChatConversation | null> {
  const list = await listConversations();
  return list.find((c) => c.id === conversationId) ?? null;
}

export async function getConversationMessages(
  conversationId: string,
  options?: { limit?: number; cursor?: string }
): Promise<ChatMessagesResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 50));
  if (options?.cursor) params.set("cursor", options.cursor);

  const data = await chatFetch<unknown>(
    `/conversations/${encodeURIComponent(conversationId)}/messages?${params.toString()}`
  );

  return normalizeMessagesResponse(data);
}

const CONV_CACHE_PREFIX = "wevraa-chat-conv-";

export function cacheConversation(conversation: ChatConversation): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${CONV_CACHE_PREFIX}${conversation.id}`, JSON.stringify(conversation));
  } catch {
    /* ignore */
  }
}

export function getCachedConversation(conversationId: string): ChatConversation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${CONV_CACHE_PREFIX}${conversationId}`);
    return raw ? (JSON.parse(raw) as ChatConversation) : null;
  } catch {
    return null;
  }
}

export function tailorDisplayName(tailor?: ChatConversation["tailor"]): string {
  if (!tailor) return "Boutique";
  return tailor.boutiqueName || tailor.name || "Boutique";
}

export function formatMessageTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function formatSenderName(sender?: ChatUser | null): string {
  if (!sender) return "";
  return [sender.firstName, sender.lastName].filter(Boolean).join(" ").trim();
}

// Re-export error classes for consumers
export { ChatApiError, ChatUnauthorizedError } from "./types";
