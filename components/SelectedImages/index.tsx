"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./SelectedImages.module.scss";

/** Slot labels only — images come from product URL / store selections. */
const STYLE_SLOTS = [
  { id: "1", label: "Fabric" },
  { id: "2", label: "Front Neck Design" },
  { id: "3", label: "Back Design" },
  { id: "4", label: "Sleeves Design" },
] as const;

interface SelectedImagesProps {
  productId?: string;
  productImage?: string;
}

function AddCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}

export default function SelectedImages({ productId, productImage }: SelectedImagesProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const frontNeckDesignImage = useBoutiqueOrderStore((s) => s.frontNeckDesignImage);
  const sleeveDesigns = useBoutiqueOrderStore((s) => s.sleeveDesigns);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);

  const resolvedProductId = productId ?? orderContext.productId;
  const resolvedProductImage = productImage ?? orderContext.productImage;

  const effectiveDesign = resolvedProductId
    ? (sleeveDesigns[resolvedProductId] ?? frontNeckDesignImage)
    : frontNeckDesignImage;

  const displayImages = useMemo(() => {
    const key = resolvedProductId ?? "global";
    const slotMap = selectedImageByProductAndSlot[key] ?? {};

    return STYLE_SLOTS.map((item) => {
      const override = slotMap[item.id];
      const isFabric = item.id === "1";
      const isFrontNeck = item.label.toLowerCase().includes("front neck");

      if (override) {
        return { ...item, image: override, filled: true as const };
      }

      if (isFabric && resolvedProductImage) {
        return { ...item, image: resolvedProductImage, filled: true as const };
      }

      if (isFrontNeck && effectiveDesign) {
        return { ...item, image: effectiveDesign, filled: true as const };
      }

      return { ...item, image: "", filled: false as const };
    });
  }, [
    effectiveDesign,
    resolvedProductId,
    resolvedProductImage,
    selectedImageByProductAndSlot,
  ]);

  const primaryImages = displayImages.slice(0, 2);
  const extraImages = displayImages.slice(2, 4);
  const canExpand = extraImages.length > 0;
  const slotCount = expanded ? displayImages.length : primaryImages.length;

  const goToSlot = (slotId: string) => {
    const params = new URLSearchParams();
    params.set("slot", slotId);
    if (resolvedProductId) params.set("productId", resolvedProductId);
    if (resolvedProductImage) params.set("image", resolvedProductImage);
    router.push(`/select-sleeve-design?${params.toString()}`);
  };

  const renderCard = (item: (typeof displayImages)[0]) => {
    if (!item.filled || !item.image) {
      return (
        <button
          key={item.id}
          type="button"
          className={styles.emptyCard}
          onClick={() => goToSlot(item.id)}
        >
          <span className={styles.emptyIcon}>
            <AddCircleIcon />
          </span>
          <span className={styles.emptyLabel}>{item.label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        className={`${styles.card} ${styles.cardInteractive}`}
        onClick={() => goToSlot(item.id)}
      >
        <Image
          src={item.image}
          alt=""
          fill
          className={styles.image}
          sizes="50vw"
        />
        <span className={styles.label}>{item.label}</span>
      </button>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Selected Styles</h2>
        <span className={styles.slots}>{slotCount} Slots</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.gridRow}>{primaryImages.map(renderCard)}</div>
        {canExpand && expanded ? (
          <div className={styles.gridRow}>{extraImages.map(renderCard)}</div>
        ) : null}
        {canExpand ? (
          <button
            type="button"
            className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ""}`}
            aria-expanded={expanded}
            aria-label={expanded ? "Show fewer styles" : "Show more styles"}
            onClick={() => setExpanded((v) => !v)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
