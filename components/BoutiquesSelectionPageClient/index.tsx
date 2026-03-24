"use client";

import Link from "next/link";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import BoutiqueSelectionHeader from "@/components/BoutiqueSelectionHeader";
import BoutiqueSelectionList from "@/components/BoutiqueSelectionList";
import BottomNav from "@/components/BottomNav";
import styles from "./BoutiquesSelectionPageClient.module.scss";

const ICON_COLORS = ["orange", "yellow", "purple", "darkpurple", "lightgray"];

export default function BoutiquesSelectionPageClient() {
  const { selectedBoutiques } = useBoutiquesSelectionStore();

  const names =
    selectedBoutiques.length > 0
      ? selectedBoutiques.map((b) => b.name).join(", ")
      : "No boutiques selected";

  const items = selectedBoutiques.map((b, i) => ({
    id: b.id,
    name: b.name,
    iconColor: ICON_COLORS[i % ICON_COLORS.length],
  }));

  const backHref = "/select-boutiques";

  return (
    <>
      <header className={styles.header}>
        <Link href={backHref} className={styles.backBtn} aria-label="Back">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      </header>
      <section className={styles.selectionSection}>
        {selectedBoutiques.length === 0 ? (
          <div className={styles.empty}>
            <p>No boutiques selected.</p>
            <Link href="/select-boutiques" className={styles.emptyLink}>
              Go back and select boutiques
            </Link>
          </div>
        ) : (
          <BoutiqueSelectionHeader count={selectedBoutiques.length} names={names}>
            <BoutiqueSelectionList items={items} />
          </BoutiqueSelectionHeader>
        )}
      </section>
      <main className="main-with-bottom-nav" />
      <BottomNav />
    </>
  );
}
