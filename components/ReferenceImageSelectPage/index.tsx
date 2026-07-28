"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/BottomSheet";
import {
  getReferenceImages,
  type ApiReferenceImage,
  type ReferenceImageType,
} from "@/lib/api";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./ReferenceImageSelectPage.module.scss";

export type ReferenceView = "back" | "front" | "side";

interface ReferenceImageSelectPageProps {
  type: ReferenceImageType;
  view?: ReferenceView;
  /** Path back to addons with query string preserved by caller. */
  returnHref?: string;
}

function slotIdFor(type: ReferenceImageType, view: ReferenceView): string {
  return type === "HANGING" ? `hanging-${view}` : `drawing-${view}`;
}

export default function ReferenceImageSelectPage({
  type,
  view = "front",
  returnHref = "/addons",
}: ReferenceImageSelectPageProps) {
  const router = useRouter();
  const setSelectedImageForSlot = useBoutiqueOrderStore((s) => s.setSelectedImageForSlot);
  const clearSelectedImageForSlot = useBoutiqueOrderStore((s) => s.clearSelectedImageForSlot);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );

  const slotId = slotIdFor(type, view);
  const currentImage = selectedImageByProductAndSlot.global?.[slotId] ?? null;

  const [items, setItems] = useState<ApiReferenceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const title = type === "HANGING" ? "Hangings" : "Drawing Image";
  const subtitle =
    type === "HANGING"
      ? "Upload or select a hanging design"
      : "Upload or select a drawing pattern";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getReferenceImages(type)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const persist = (imageUrl: string) => {
    setSelectedImageForSlot("global", slotId, imageUrl);
  };

  const handleSelect = (imageUrl: string) => {
    persist(imageUrl);
  };

  const handleClear = () => {
    clearSelectedImageForSlot("global", slotId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    persist(objectUrl);
  };

  const pickGallery = () => {
    setUploadSheetOpen(false);
    requestAnimationFrame(() => galleryRef.current?.click());
  };

  const pickCamera = () => {
    setUploadSheetOpen(false);
    requestAnimationFrame(() => cameraRef.current?.click());
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          aria-label="Back"
          onClick={() => navigateBack(router, returnHref ?? "/addons")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.doneBtn}
          onClick={() => navigateBack(router, returnHref ?? "/addons")}
        >
          Done
        </button>
      </header>

      <section className={styles.uploadSection}>
        <h2 className={styles.sectionLabel}>Your upload</h2>
        <button
          type="button"
          className={styles.uploadCard}
          onClick={() => setUploadSheetOpen(true)}
          aria-label="Upload image"
        >
          {currentImage ? (
            <>
              <Image
                src={currentImage}
                alt=""
                fill
                className={styles.uploadPreview}
                sizes="100vw"
              />
              <span
                className={styles.clearBtn}
                role="button"
                tabIndex={0}
                aria-label="Clear image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }
                }}
              >
                ×
              </span>
            </>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.uploadPlus}>+</span>
              <span>Upload from Gallery or Camera</span>
            </div>
          )}
        </button>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          tabIndex={-1}
          aria-hidden
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          tabIndex={-1}
          aria-hidden
        />
      </section>

      <section className={styles.designsSection}>
        <h2 className={styles.sectionLabel}>Select from designs</h2>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.card} shimmer`} />
            ))}
          </div>
        ) : error ? (
          <p className={styles.message}>Failed to load designs.</p>
        ) : items.length === 0 ? (
          <p className={styles.message}>No designs available.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => {
              const selected = currentImage === item.imageUrl;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
                  onClick={() => handleSelect(item.imageUrl)}
                  aria-pressed={selected}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.label || title}
                    fill
                    className={styles.cardImage}
                    sizes="50vw"
                  />
                  {item.label ? (
                    <span className={styles.cardLabel}>{item.label}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <BottomSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        title="Upload photo"
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
    </div>
  );
}
