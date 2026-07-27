"use client";

import { useRouter } from "next/navigation";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./MeasurementHeader.module.scss";

interface MeasurementHeaderProps {
  sizeLabel?: string;
}

export default function MeasurementHeader({ sizeLabel }: MeasurementHeaderProps) {
  const router = useRouter();
  const selectedSize = useBoutiquesSelectionStore((s) => s.orderContext.selectedSize);
  const label = sizeLabel || selectedSize || "—";

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
      <h1 className={styles.title}>SIZE | {label}</h1>
    </header>
  );
}
