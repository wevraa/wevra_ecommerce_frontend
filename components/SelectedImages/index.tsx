"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { SelectedImage } from "@/data/dummy";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./SelectedImages.module.scss";

interface SelectedImagesProps {
  images: SelectedImage[];
  productId?: string;
  productImage?: string;
}

export default function SelectedImages({ images, productId, productImage }: SelectedImagesProps) {
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
    return images.map((item) => {
      const override = slotMap[item.id];
      if (override) return { ...item, image: override };
      if (item.id === "1" && resolvedProductImage) {
        return { ...item, image: resolvedProductImage };
      }
      const isFrontNeck = item.label.toLowerCase().includes("front neck");
      if (isFrontNeck && effectiveDesign) return { ...item, image: effectiveDesign };
      return item;
    });
  }, [
    images,
    effectiveDesign,
    resolvedProductId,
    resolvedProductImage,
    selectedImageByProductAndSlot,
  ]);

  const primaryImages = displayImages.slice(0, 2);
  const extraImages = displayImages.slice(2, 4);
  const canExpand = extraImages.length > 0;
  const slotCount = displayImages.length;

  const renderCard = (item: (typeof displayImages)[0]) => (
    <button
      key={item.id}
      type="button"
      className={`${styles.card} ${styles.cardInteractive}`}
      onClick={() => {
        const params = new URLSearchParams();
        params.set("slot", item.id);
        if (resolvedProductId) params.set("productId", resolvedProductId);
        if (resolvedProductImage) params.set("image", resolvedProductImage);
        router.push(`/select-sleeve-design?${params.toString()}`);
      }}
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

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Selected Styles</h2>
        <span className={styles.slots}>{slotCount} Slots</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.gridRow}>{primaryImages.map(renderCard)}</div>
        {canExpand ? (
          <button
            type="button"
            className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ""}`}
            aria-expanded={expanded}
            aria-label={expanded ? "Show fewer styles" : "Show more styles"}
            onClick={() => setExpanded((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ) : null}
        {canExpand && expanded ? (
          <div className={styles.gridRow}>{extraImages.map(renderCard)}</div>
        ) : null}
      </div>
    </section>
  );
}
