"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import ChatBillCard from "@/components/ChatBillCard";
import { formatMessageTime, formatSenderName } from "@/lib/chat/api";
import { formatRequiredBy } from "@/lib/chat/format";
import type { ChatAttachment, ChatMessage, ChatReplyTo } from "@/lib/chat/types";
import {
  getTailorName,
  useConversationChat,
  type DisplayMessage,
} from "@/hooks/useConversationChat";
import styles from "./ChatPageClient.module.scss";

const MAX_MESSAGE_LENGTH = 4000;

interface ChatPageClientProps {
  conversationId: string;
}

function ReplyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function getMessagePreview(msg: {
  type?: ChatMessage["type"];
  body?: string | null;
  category?: string | null;
}): string {
  if (msg.type === "ORDER_REQUEST") {
    return msg.category ?? "Order request";
  }
  if (msg.type === "BILL") {
    return msg.body?.trim() || "Bill received";
  }
  return msg.body?.trim() || "Message";
}

function buildReplyTo(msg: DisplayMessage): ChatReplyTo {
  return {
    id: msg.id,
    body: msg.body,
    type: msg.type,
    category: msg.category,
    sender: msg.sender ?? null,
  };
}

function resolveReplyPreview(
  msg: DisplayMessage,
  messageById: Map<string, DisplayMessage>
): { label: string; text: string } {
  const reply = msg.replyTo;
  const replyId = reply?.id ?? msg.replyToMessageId;
  const source = replyId ? messageById.get(replyId) : undefined;
  const sender = reply?.sender ?? source?.sender;
  const senderLabel = formatSenderName(sender) || (source?.isOwn ? "You" : "Message");
  const previewSource = reply ?? source;
  const text = previewSource ? getMessagePreview(previewSource) : "Message";
  return { label: senderLabel, text };
}

function QuotedReply({
  msg,
  messageById,
}: {
  msg: DisplayMessage;
  messageById: Map<string, DisplayMessage>;
}) {
  if (!msg.replyTo && !msg.replyToMessageId) return null;
  const { label, text } = resolveReplyPreview(msg, messageById);

  return (
    <div className={styles.quotedReply}>
      <span className={styles.quotedReplyLabel}>{label}</span>
      <span className={styles.quotedReplyText}>{text}</span>
    </div>
  );
}

function ReplyButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={`${styles.replyBtn} ${className ?? ""}`}
      onClick={onClick}
      aria-label="Reply to message"
    >
      <ReplyIcon />
    </button>
  );
}

function getOrderImages(msg: ChatMessage): ChatAttachment[] {
  if (msg.attachments.length > 0) return msg.attachments;
  return msg.imageUrls.map((url) => ({ url }));
}

function OrderRequestCard({
  msg,
  timeLabel,
  onReply,
  isOwn,
}: {
  msg: ChatMessage;
  timeLabel: string;
  onReply: () => void;
  isOwn: boolean;
}) {
  const images = getOrderImages(msg);
  const primaryImage = images[0]?.url ?? "/images/placeholder-rect.svg";
  const hasMeasurements = msg.measurements.length > 0;
  const hasAddons = msg.addons.length > 0;

  return (
    <div className={`${styles.quoteRowWrap} ${isOwn ? "" : styles.quoteRowWrapIn}`}>
      {isOwn ? <ReplyButton onClick={onReply} className={styles.replyBtnQuote} /> : null}
      <div className={styles.quoteBubble}>
        <div className={styles.quoteImages}>
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.url} className={styles.quoteImageWrap}>
                <Image
                  src={img.url}
                  alt={img.label ?? "Attachment"}
                  fill
                  className={styles.quoteImage}
                  sizes="72px"
                  unoptimized={img.url.startsWith("blob:")}
                />
                {img.label ? <span className={styles.imageCaption}>{img.label}</span> : null}
              </div>
            ))
          ) : (
            <div className={styles.quoteImageWrap}>
              <Image src={primaryImage} alt="" fill className={styles.quoteImage} sizes="72px" />
            </div>
          )}
        </div>
        <p className={styles.quoteTitle}>{msg.category ?? "Order request"}</p>
        {msg.orderTypes.length > 0 ? (
          <p className={styles.quoteTypes}>{msg.orderTypes.join(", ")}</p>
        ) : null}
        {msg.description ? <p className={styles.quoteDescription}>{msg.description}</p> : null}
        <p className={styles.quoteDate}>
          Required by: <strong>{formatRequiredBy(msg.requiredBy)}</strong>
        </p>
        <p className={`${styles.quoteStatus} ${hasMeasurements ? styles.positive : styles.muted}`}>
          {hasMeasurements ? "Measurement added" : "No measurement selected"}
        </p>
        <p className={`${styles.quoteStatus} ${hasAddons ? styles.positive : styles.muted}`}>
          {hasAddons ? "Add ons selected" : "No add-ons selected"}
        </p>
        {isOwn && !msg.orderId ? (
          <p className={styles.quotePending}>Waiting for tailor to confirm and send bill</p>
        ) : null}
        <p className={styles.quoteTime}>{timeLabel}</p>
      </div>
      {!isOwn ? <ReplyButton onClick={onReply} className={styles.replyBtnIn} /> : null}
    </div>
  );
}

function MessageBubble({
  msg,
  messageById,
  onReply,
}: {
  msg: DisplayMessage;
  messageById: Map<string, DisplayMessage>;
  onReply: (msg: DisplayMessage) => void;
}) {
  const timeLabel = formatMessageTime(msg.createdAt);
  const senderName = formatSenderName(msg.sender);

  if (msg.type === "ORDER_REQUEST") {
    const rowClass = msg.isOwn ? styles.rowOut : styles.rowIn;
    return (
      <div className={rowClass}>
        <OrderRequestCard
          msg={msg}
          timeLabel={timeLabel}
          onReply={() => onReply(msg)}
          isOwn={msg.isOwn}
        />
      </div>
    );
  }

  if (msg.type === "BILL") {
    if (msg.bill) {
      return (
        <div className={styles.rowIn}>
          <div className={styles.messageRowWrap}>
            <ChatBillCard msg={msg} bill={msg.bill} timeLabel={timeLabel} />
            <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnIn} />
          </div>
        </div>
      );
    }
    const billText = msg.body?.trim() || "Bill received";
    return (
      <div className={styles.rowIn}>
        <div className={styles.messageRowWrap}>
          <div className={styles.bubble}>
            {senderName ? <span className={styles.senderName}>{senderName}</span> : null}
            <p className={styles.bubbleText}>{billText}</p>
            <span className={styles.bubbleTime}>{timeLabel}</span>
          </div>
          <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnIn} />
        </div>
      </div>
    );
  }

  if (msg.type === "IMAGE") {
    const images = getOrderImages(msg);
    const rowClass = msg.isOwn ? styles.rowOut : styles.rowIn;
    return (
      <div className={rowClass}>
        <div className={styles.messageRowWrap}>
          {msg.isOwn ? (
            <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnOut} />
          ) : null}
          <div className={styles.bubble}>
            {!msg.isOwn && senderName ? (
              <span className={styles.senderName}>{senderName}</span>
            ) : null}
            <div className={styles.imageGallery}>
              {images.map((img) => (
                <div key={img.url} className={styles.galleryImageWrap}>
                  <Image
                    src={img.url}
                    alt={img.label ?? "Image"}
                    fill
                    className={styles.galleryImage}
                    sizes="120px"
                    unoptimized={img.url.startsWith("blob:")}
                  />
                </div>
              ))}
            </div>
            <span className={styles.bubbleTime}>{timeLabel}</span>
          </div>
          {!msg.isOwn ? (
            <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnIn} />
          ) : null}
        </div>
      </div>
    );
  }

  const text = msg.body?.trim();
  if (!text) return null;

  const rowClass = msg.isOwn ? styles.rowOut : styles.rowIn;

  return (
    <div className={rowClass}>
      <div className={styles.messageRowWrap}>
        {msg.isOwn ? (
          <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnOut} />
        ) : null}
        <div className={styles.bubble}>
          {!msg.isOwn && senderName ? (
            <span className={styles.senderName}>{senderName}</span>
          ) : null}
          <QuotedReply msg={msg} messageById={messageById} />
          <p className={styles.bubbleText}>{text}</p>
          <span className={styles.bubbleTime}>{timeLabel}</span>
        </div>
        {!msg.isOwn ? (
          <ReplyButton onClick={() => onReply(msg)} className={styles.replyBtnIn} />
        ) : null}
      </div>
    </div>
  );
}

export default function ChatPageClient({ conversationId }: ChatPageClientProps) {
  const router = useRouter();
  const {
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
    clearToast,
  } = useConversationChat(conversationId);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<DisplayMessage | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messageById = useMemo(() => {
    const map = new Map<string, DisplayMessage>();
    for (const msg of messages) map.set(msg.id, msg);
    return map;
  }, [messages]);

  const boutiqueName = getTailorName(conversation);
  const logoUrl = conversation?.tailor?.logoUrl;

  useEffect(() => {
    if (unauthorized) setLoginOpen(true);
    else setLoginOpen(false);
  }, [unauthorized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 4000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop < 80) loadOlder();
  };

  const handleReply = (msg: DisplayMessage) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const replyToMessageId = replyingTo?.id;
    const replyTo = replyingTo ? buildReplyTo(replyingTo) : null;
    sendMessage(text, replyToMessageId, replyTo);
    setDraft("");
    setReplyingTo(null);
  };

  const canSend = draft.trim().length > 0 && draft.length <= MAX_MESSAGE_LENGTH;

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <span className={`${styles.skelBack} shimmer`} />
          <span className={`${styles.skelTitle} shimmer`} />
          <span className={styles.headerSpacer} />
        </header>
        <div className={styles.messages}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.rowOut}>
              <span className={`${styles.skelBubble} shimmer`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className={styles.headerTitle}>Chat</h1>
          <div className={styles.headerSpacer} />
        </header>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button type="button" className={styles.errorBtn} onClick={() => router.back()}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.boutiqueInfo}>
          {logoUrl ? (
            <div className={styles.logoWrap}>
              <Image src={logoUrl} alt="" fill className={styles.logoImage} sizes="40px" />
            </div>
          ) : (
            <div className={styles.avatarStack} aria-hidden>
              <span className={`${styles.circle} ${styles.b1}`} />
              <span className={`${styles.circle} ${styles.b2}`} />
              <span className={`${styles.circle} ${styles.b3}`} />
            </div>
          )}
          <div className={styles.boutiqueMeta}>
            <p className={styles.boutiqueName}>{boutiqueName}</p>
            <p className={styles.online}>Online</p>
          </div>
        </div>

        <Link href="/orders" className={styles.ordersBtn} aria-label="Orders">
          <span className={styles.ordersIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          Orders
        </Link>
      </header>

      {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
      {loadingMore ? <div className={styles.loadingMore}>Loading older messages…</div> : null}

      <div className={styles.messages} ref={messagesRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <p className={styles.emptyChat}>No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              messageById={messageById}
              onReply={handleReply}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.composerWrap}>
        {replyingTo ? (
          <div className={styles.replyComposerPreview}>
            <div className={styles.replyComposerMeta}>
              <span className={styles.replyComposerLabel}>
                Replying to{" "}
                {formatSenderName(replyingTo.sender) || (replyingTo.isOwn ? "yourself" : "message")}
              </span>
              <p className={styles.replyComposerText}>{getMessagePreview(replyingTo)}</p>
            </div>
            <button
              type="button"
              className={styles.replyComposerClose}
              onClick={handleCancelReply}
              aria-label="Cancel reply"
            >
              ×
            </button>
          </div>
        ) : null}

        <div className={styles.composer}>
          <button type="button" className={styles.composerBtn} aria-label="Attach">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={replyingTo ? "Write a reply..." : "Type a message..."}
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
              if (e.key === "Escape" && replyingTo) {
                e.preventDefault();
                handleCancelReply();
              }
            }}
          />
          <button
            type="button"
            className={styles.composerBtn}
            aria-label="Send"
            disabled={!canSend}
            onClick={handleSend}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          if (unauthorized) router.push("/profile");
        }}
      />
    </div>
  );
}
