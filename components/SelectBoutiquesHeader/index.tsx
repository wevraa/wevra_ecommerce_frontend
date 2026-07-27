"use client";

import { useRouter } from "next/navigation";
import styles from "./SelectBoutiquesHeader.module.scss";

export default function SelectBoutiquesHeader() {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backBtn}
        aria-label="Back"
        onClick={() => router.back()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 className={styles.title}>Custom Order</h1>
      <span className={styles.spacer} aria-hidden />
    </header>
  );
}
