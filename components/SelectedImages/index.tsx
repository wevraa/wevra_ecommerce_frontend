"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
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

const FABRIC_SLOT_ID = "1";

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
  const [fabricUploadOpen, setFabricUploadOpen] = useState(false);
  /** Suppress product/design fallbacks after the user clears a slot. */
  const [suppressedSlots, setSuppressedSlots] = useState<Set<string>>(() => new Set());
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const frontNeckDesignImage = useBoutiqueOrderStore((s) => s.frontNeckDesignImage);
  const sleeveDesigns = useBoutiqueOrderStore((s) => s.sleeveDesigns);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );
  const setSelectedImageForSlot = useBoutiqueOrderStore((s) => s.setSelectedImageForSlot);
  const clearSelectedImageForSlot = useBoutiqueOrderStore((s) => s.clearSelectedImageForSlot);
  const clearSleeveDesign = useBoutiqueOrderStore((s) => s.clearSleeveDesign);
  const clearFrontNeckDesign = useBoutiqueOrderStore((s) => s.clearFrontNeckDesign);
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);

  const resolvedProductId = productId ?? orderContext.productId;
  const resolvedProductImage = productImage ?? orderContext.productImage;
  const storeKey = resolvedProductId ?? "global";

  const effectiveDesign = resolvedProductId
    ? (sleeveDesigns[resolvedProductId] ?? frontNeckDesignImage)
    : frontNeckDesignImage;

  // If a new image is chosen for a cleared slot, allow it again
  useEffect(() => {
    const slotMap = selectedImageByProductAndSlot[storeKey] ?? {};
    setSuppressedSlots((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of prev) {
        if (slotMap[id]) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [storeKey, selectedImageByProductAndSlot]);

  const displayImages = useMemo(() => {
    const slotMap = selectedImageByProductAndSlot[storeKey] ?? {};

    return STYLE_SLOTS.map((item) => {
      const override = slotMap[item.id];
      const isFabric = item.id === FABRIC_SLOT_ID;
      const isFrontNeck = item.label.toLowerCase().includes("front neck");

      if (override) {
        return { ...item, image: override, filled: true as const };
      }

      if (suppressedSlots.has(item.id)) {
        return { ...item, image: "", filled: false as const };
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
    resolvedProductImage,
    selectedImageByProductAndSlot,
    storeKey,
    suppressedSlots,
  ]);

  const primaryImages = displayImages.slice(0, 2);
  const extraImages = displayImages.slice(2, 4);
  const canExpand = extraImages.length > 0;
  const slotCount = expanded ? displayImages.length : primaryImages.length;

  const goToSlot = (slotId: string) => {
    const params = new URLSearchParams();
    params.set("slot", slotId);
    if (resolvedProductId) params.set("productId", resolvedProductId);
    if (resolvedProductImage && !suppressedSlots.has(FABRIC_SLOT_ID)) {
      params.set("image", resolvedProductImage);
    }
    router.push(`/select-sleeve-design?${params.toString()}`);
  };

  const openFabricUpload = () => {
    setFabricUploadOpen(true);
  };

  const handleSlotActivate = (slotId: string) => {
    if (slotId === FABRIC_SLOT_ID) {
      openFabricUpload();
      return;
    }
    goToSlot(slotId);
  };

  const persistFabricImage = (imageUrl: string) => {
    setSelectedImageForSlot(storeKey, FABRIC_SLOT_ID, imageUrl);
    setOrderContext({ productImage: imageUrl });
    setSuppressedSlots((prev) => {
      if (!prev.has(FABRIC_SLOT_ID)) return prev;
      const next = new Set(prev);
      next.delete(FABRIC_SLOT_ID);
      return next;
    });
  };

  const handleFabricFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    persistFabricImage(URL.createObjectURL(file));
  };

  const pickGallery = () => {
    setFabricUploadOpen(false);
    requestAnimationFrame(() => galleryRef.current?.click());
  };

  const pickCamera = () => {
    setFabricUploadOpen(false);
    requestAnimationFrame(() => cameraRef.current?.click());
  };

  const handleClearSlot = (slotId: string) => {
    clearSelectedImageForSlot(storeKey, slotId);
    setSuppressedSlots((prev) => new Set(prev).add(slotId));

    if (slotId === FABRIC_SLOT_ID) {
      setOrderContext({ productImage: undefined });
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.delete("image");
      const q = params.toString();
      router.replace(q ? `/select-boutiques?${q}` : "/select-boutiques");
    }

    if (slotId === "2") {
      clearFrontNeckDesign();
      if (resolvedProductId) clearSleeveDesign(resolvedProductId);
      setOrderContext({ sleeveDesignImage: undefined });
    }
  };

  const renderCard = (item: (typeof displayImages)[0]) => {
    if (!item.filled || !item.image) {
      return (
        <button
          key={item.id}
          type="button"
          className={styles.emptyCard}
          onClick={() => handleSlotActivate(item.id)}
        >
          <span className={styles.emptyIcon}>
            <AddCircleIcon />
          </span>
          <span className={styles.emptyLabel}>{item.label}</span>
        </button>
      );
    }

    return (
      <div key={item.id} className={`${styles.card} ${styles.cardInteractive}`}>
        <button
          type="button"
          className={styles.cardSelect}
          onClick={() => handleSlotActivate(item.id)}
          aria-label={
            item.id === FABRIC_SLOT_ID
              ? `Upload or change ${item.label}`
              : `Change ${item.label}`
          }
        >
          <Image
            src={item.image}
            alt=""
            fill
            className={styles.image}
            sizes="50vw"
            unoptimized={item.image.startsWith("blob:")}
          />
          <span className={styles.label}>{item.label}</span>
        </button>
        <button
          type="button"
          className={styles.clearBtn}
          aria-label={`Remove ${item.label}`}
          onClick={() => handleClearSlot(item.id)}
        >
          ×
        </button>
      </div>
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

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFabricFileChange}
        tabIndex={-1}
        aria-hidden
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleFabricFileChange}
        tabIndex={-1}
        aria-hidden
      />

      <BottomSheet
        open={fabricUploadOpen}
        onClose={() => setFabricUploadOpen(false)}
        title="Upload fabric"
      >
        <div className={styles.uploadOptions}>
          <button type="button" className={styles.uploadOptionBtn} onClick={pickCamera}>
            Camera
          </button>
          <button type="button" className={styles.uploadOptionBtn} onClick={pickGallery}>
            Gallery
          </button>
        </div>
      </BottomSheet>
    </section>
  );
}
