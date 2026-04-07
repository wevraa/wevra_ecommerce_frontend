"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { SelectedImage } from "@/data/dummy";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
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

  const effectiveDesign = productId
    ? (sleeveDesigns[productId] ?? frontNeckDesignImage)
    : frontNeckDesignImage;

  const displayImages = useMemo(() => {
    const key = productId ?? "global";
    const slotMap = selectedImageByProductAndSlot[key] ?? {};
    return images.map((item) => {
      const override = slotMap[item.id];
      if (override) return { ...item, image: override };
      // backward-compat: keep supporting old "front neck" selection
      const isFrontNeck = item.label.toLowerCase().includes("front neck");
      if (isFrontNeck && effectiveDesign) return { ...item, image: effectiveDesign };
      return item;
    });
  }, [images, effectiveDesign, productId, selectedImageByProductAndSlot]);

  const primaryImages = displayImages.slice(0, 2);
  const extraImages = displayImages.slice(2, 4);
  const canExpand = extraImages.length > 0;

  const renderCard = (item: (typeof displayImages)[0]) => {
    const showPlusBadge = false;
    return (
      <button
        key={item.id}
        type="button"
        className={`${styles.card} ${styles.cardInteractive}`}
        onClick={() => {
          const params = new URLSearchParams();
          params.set("slot", item.id);
          if (productId) params.set("productId", productId);
          if (productImage) params.set("image", productImage);
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
        {showPlusBadge && (
          <span className={styles.plusBadge} aria-hidden>
            +
          </span>
        )}
        <span className={styles.label}>{item.label}</span>
      </button>
    );
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Selected Images</h2>
      <div className={styles.layout}>
        <div className={styles.primaryRowWrap}>
          <div className={styles.gridRow}>{primaryImages.map(renderCard)}</div>
          {canExpand ? (
            <button
              type="button"
              className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ""}`}
              aria-expanded={expanded}
              aria-label={expanded ? "Show fewer images" : "Show more images"}
              onClick={() => setExpanded((v) => !v)}
            >
              <svg
                width="20"
                height="20"
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
        </div>
        {canExpand && expanded ? (
          <div className={styles.gridRow}>{extraImages.map(renderCard)}</div>
        ) : null}
      </div>
    </section>
  );
}
