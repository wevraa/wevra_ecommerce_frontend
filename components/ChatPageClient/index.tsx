"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { formatMessageTime, formatSenderName } from "@/lib/chat/api";
import type { QuoteOrderPayload } from "@/lib/chat/types";
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

function QuoteCard({ quote, timeLabel }: { quote: QuoteOrderPayload; timeLabel: string }) {
  const images = [
    quote.productImage && { src: quote.productImage, alt: "Fabric" },
    quote.sleeveDesignImage && { src: quote.sleeveDesignImage, alt: "Sleeve design" },
  ].filter(Boolean) as { src: string; alt: string }[];

  const primaryImage = images[0]?.src ?? "/images/placeholder-rect.svg";

  return (
    <div className={styles.quoteRowWrap}>
      <span className={styles.replyIcon} aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 14 4 9 9 4" />
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
      </span>
      <div className={styles.quoteBubble}>
        <div className={styles.quoteImages}>
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.src} className={styles.quoteImageWrap}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className={styles.quoteImage}
                  sizes="72px"
                  unoptimized={img.src.startsWith("blob:")}
                />
              </div>
            ))
          ) : (
            <div className={styles.quoteImageWrap}>
              <Image src={primaryImage} alt="" fill className={styles.quoteImage} sizes="72px" />
            </div>
          )}
        </div>
        <p className={styles.quoteTitle}>{quote.productTitle}</p>
        <p className={styles.quoteDate}>
          Required Date: <strong>{quote.requiredDateLabel}</strong>
        </p>
        <p
          className={`${styles.quoteStatus} ${
            quote.hasMeasurementSelected ? styles.positive : styles.muted
          }`}
        >
          {quote.hasMeasurementSelected ? "Measurement added" : "No measurement selected"}
        </p>
        {quote.hasAddonsSelected && (
          <p className={`${styles.quoteStatus} ${styles.positive}`}>Add ons selected</p>
        )}
        <p className={styles.quoteTime}>{timeLabel}</p>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: DisplayMessage }) {
  const timeLabel = formatMessageTime(msg.createdAt);
  const senderName = formatSenderName(msg.sender);

  if (msg.quoteMeta && msg.isOwn) {
    return (
      <div className={styles.rowOut}>
        <QuoteCard quote={msg.quoteMeta} timeLabel={timeLabel} />
      </div>
    );
  }

  const rowClass = msg.isOwn ? styles.rowOut : styles.rowIn;

  return (
    <div className={rowClass}>
      <div className={styles.bubble}>
        {!msg.isOwn && senderName ? (
          <span className={styles.senderName}>{senderName}</span>
        ) : null}
        <p className={styles.bubbleText}>{msg.body}</p>
        <span className={styles.bubbleTime}>{timeLabel}</span>
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
  const [loginOpen, setLoginOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

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

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft("");
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
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.composer}>
        <button type="button" className={styles.composerBtn} aria-label="Attach">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          type="text"
          className={styles.input}
          placeholder="Type a message..."
          value={draft}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
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
