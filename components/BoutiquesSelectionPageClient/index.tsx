"use client";

import { useRouter } from "next/navigation";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import BoutiqueSelectionHeader from "@/components/BoutiqueSelectionHeader";
import BoutiqueSelectionList from "@/components/BoutiqueSelectionList";
import BottomNav from "@/components/BottomNav";
import styles from "./BoutiquesSelectionPageClient.module.scss";

const ICON_COLORS = ["orange", "yellow", "purple", "darkpurple", "lightgray"];

export default function BoutiquesSelectionPageClient() {
  const router = useRouter();
  const { selectedBoutiques, clearSelection, orderContext } =
    useBoutiquesSelectionStore();

  const names =
    selectedBoutiques.length > 0
      ? selectedBoutiques.map((b) => b.name).join(", ")
      : "No boutiques selected";

  const items = selectedBoutiques.map((b, i) => ({
    id: b.id,
    name: b.name,
    iconColor: ICON_COLORS[i % ICON_COLORS.length],
  }));

  const handleBack = () => {
    clearSelection();
    const params = new URLSearchParams();
    if (orderContext.productId) params.set("productId", orderContext.productId);
    if (orderContext.productImage) params.set("image", orderContext.productImage);
    router.push(
      params.size > 0 ? `/select-boutiques?${params.toString()}` : "/select-boutiques"
    );
  };

  return (
    <>
      <header className={styles.header}>
        <button
          type="button"
          onClick={handleBack}
          className={styles.backBtn}
          aria-label="Back"
        >
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
        </button>
      </header>
      <section className={styles.selectionSection}>
        {selectedBoutiques.length === 0 ? (
          <div className={styles.empty}>
            <p>No boutiques selected.</p>
            <button
              type="button"
              onClick={handleBack}
              className={styles.emptyLink}
            >
              Go back and select boutiques
            </button>
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
