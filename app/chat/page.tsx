"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { getAccessToken } from "@/lib/auth";
import {
  listConversations,
  tailorDisplayName,
  formatMessageTime,
  ChatUnauthorizedError,
} from "@/lib/chat/api";
import type { ChatConversation } from "@/lib/chat/types";
import styles from "./ChatInbox.module.scss";

export default function ChatInboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      setLoginOpen(true);
      setLoading(false);
      return;
    }

    listConversations()
      .then(setItems)
      .catch((e) => {
        if (e instanceof ChatUnauthorizedError) setLoginOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => router.back()} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Messages</h1>
        <div className={styles.spacer} />
      </header>

      <main className={styles.main}>
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No conversations yet.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((c) => (
              <li key={c.id}>
                <Link href={`/chat/${c.id}`} className={styles.row}>
                  <div>
                    <p className={styles.name}>{tailorDisplayName(c.tailor)}</p>
                    {c.lastMessage ? (
                      <p className={styles.preview}>
                        {c.lastMessage.type === "ORDER_REQUEST"
                          ? c.lastMessage.category ?? "Order request"
                          : c.lastMessage.body ?? ""}
                      </p>
                    ) : null}
                  </div>
                  {c.lastMessage?.createdAt ? (
                    <span className={styles.time}>
                      {formatMessageTime(c.lastMessage.createdAt)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
