"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChatStore, type ChatMessage } from "@/lib/stores/chatStore";
import styles from "./ChatPageClient.module.scss";

interface ChatPageClientProps {
  boutiqueId: string;
}

function QuoteMessage({ msg }: { msg: ChatMessage }) {
  const quote = msg.quote!;
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
                <Image src={img.src} alt={img.alt} fill className={styles.quoteImage} sizes="72px" unoptimized={img.src.startsWith("blob:")} />
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
        <p className={styles.quoteTime}>{msg.timeLabel}</p>
      </div>
    </div>
  );
}

export default function ChatPageClient({ boutiqueId }: ChatPageClientProps) {
  const router = useRouter();
  const thread = useChatStore((s) => s.threads[boutiqueId]);
  const addTextMessage = useChatStore((s) => s.addTextMessage);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const boutiqueName = thread?.boutiqueName ?? "Boutique";
  const messages = thread?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    addTextMessage(boutiqueId, boutiqueName, text, "out");
    setDraft("");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.boutiqueInfo}>
          <div className={styles.avatarStack} aria-hidden>
            <span className={`${styles.circle} ${styles.b1}`} />
            <span className={`${styles.circle} ${styles.b2}`} />
            <span className={`${styles.circle} ${styles.b3}`} />
          </div>
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

      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.emptyChat}>No messages yet. Send a quote from Order Quote.</p>
        ) : (
          messages.map((msg) => {
            if (msg.type === "quote") {
              return (
                <div key={msg.id} className={styles.rowOut}>
                  <QuoteMessage msg={msg} />
                </div>
              );
            }
            const rowClass = msg.direction === "out" ? styles.rowOut : styles.rowIn;
            return (
              <div key={msg.id} className={rowClass}>
                <div className={styles.bubble}>
                  <p className={styles.bubbleText}>{msg.text}</p>
                  <span className={styles.bubbleTime}>{msg.timeLabel}</span>
                </div>
              </div>
            );
          })
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
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button type="button" className={styles.composerBtn} aria-label="Camera">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
