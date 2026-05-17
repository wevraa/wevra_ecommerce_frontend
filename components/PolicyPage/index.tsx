"use client";

import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import styles from "./PolicyPage.module.scss";

interface PolicyPageProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyPage({ title, children }: PolicyPageProps) {
  const router = useRouter();
  return (
    <>
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
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.spacer} />
      </header>

      <main className={`${styles.main} main-with-bottom-nav`}>
        <article className={styles.article}>{children}</article>
      </main>

      <BottomNav />
    </>
  );
}
