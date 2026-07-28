"use client";

import { useRouter } from "next/navigation";
import type { AddonsNavParams } from "@/lib/addonsNavigation";
import { getAddonsReturnHref } from "@/lib/addonsNavigation";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./AddonsHeader.module.scss";

export default function AddonsHeader({
  returnTo,
  productId,
  productImage,
  boutiqueId,
}: AddonsNavParams) {
  const router = useRouter();

  const handleBack = () => {
    navigateBack(
      router,
      getAddonsReturnHref({
        returnTo: returnTo ?? "select-boutiques",
        productId,
        productImage,
        boutiqueId,
      })
    );
  };

  return (
    <header className={styles.header}>
      <button type="button" onClick={handleBack} className={styles.backBtn} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 className={styles.title}>Add ons</h1>
    </header>
  );
}
