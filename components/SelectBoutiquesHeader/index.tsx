"use client";

import { useRouter } from "next/navigation";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./SelectBoutiquesHeader.module.scss";

function ChevronLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

export default function SelectBoutiquesHeader() {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backBtn}
        aria-label="Back"
        onClick={() => navigateBack(router, "/")}
      >
        <ChevronLeftIcon />
      </button>
      <h1 className={styles.title}>Custom Order</h1>
      <span className={styles.spacer} aria-hidden />
    </header>
  );
}
