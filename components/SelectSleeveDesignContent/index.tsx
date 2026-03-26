"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import type { ApiDesign } from "@/lib/api";
import styles from "./SelectSleeveDesignContent.module.scss";

interface SelectSleeveDesignContentProps {
  productId?: string;
  returnImage?: string;
}

export default function SelectSleeveDesignContent({
  productId,
  returnImage,
}: SelectSleeveDesignContentProps) {
  const router = useRouter();
  const setFrontNeckDesign = useBoutiqueOrderStore((s) => s.setFrontNeckDesign);
  const setSleeveDesign = useBoutiqueOrderStore((s) => s.setSleeveDesign);

  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    handleSelectDesign(objectUrl);
    // reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch("https://api.wevraa.in/api/v1/designs")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data: ApiDesign[]) => {
        if (!cancelled) {
          setDesigns(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectDesign = (imageUrl: string) => {
    if (productId) {
      setSleeveDesign(productId, imageUrl);
    }
    setFrontNeckDesign(imageUrl);

    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (returnImage) params.set("image", returnImage);
    router.push(
      params.size > 0
        ? `/select-boutiques?${params.toString()}`
        : "/select-boutiques"
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {/* Static upload card always shown first */}
        <article
          className={`${styles.card} ${styles.cardSelectable}`}
          role="button"
          tabIndex={0}
          aria-label="Upload your own design"
          onClick={handleUploadClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleUploadClick();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileChange}
            aria-hidden
            tabIndex={-1}
          />
          <div className={styles.cardImage}>
            <div className={styles.uploadPlaceholder}>
              <svg
                className={styles.uploadIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
        </article>

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <article key={`skel-${i}`} className={styles.card}>
              <div className={`${styles.cardImage} shimmer`} />
              <div className={`${styles.cardLabelSkeleton} shimmer`} />
            </article>
          ))}

        {/* Error state */}
        {!loading && error && (
          <p className={styles.errorMsg}>
            Failed to load designs. Please try again.
          </p>
        )}

        {/* API-fetched designs */}
        {!loading &&
          !error &&
          designs.map((design) => (
            <article
              key={design.id}
              role="button"
              tabIndex={0}
              className={`${styles.card} ${styles.cardSelectable}`}
              onClick={() => handleSelectDesign(design.imageUrl)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectDesign(design.imageUrl);
                }
              }}
            >
              <div className={styles.cardImage}>
                <Image
                  src={design.imageUrl}
                  alt={design.designName}
                  fill
                  className={styles.cardImageContent}
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>
              <div className={`${styles.cardLabel} ${styles.cardLabelSecondary}`}>
                {design.designName}
              </div>
            </article>
          ))}

        {/* Empty state */}
        {!loading && !error && designs.length === 0 && (
          <p className={styles.errorMsg}>No designs available.</p>
        )}
      </div>
    </div>
  );
}
