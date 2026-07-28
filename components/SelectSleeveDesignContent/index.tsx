"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/BottomSheet";
import { getDesignsPage, type ApiDesign } from "@/lib/api";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./SelectSleeveDesignContent.module.scss";

export type DesignSlotKey = "front" | "sleeve" | "back";

const SLOT_META: {
  key: DesignSlotKey;
  label: string;
  storeSlotId: string;
  tags: string[];
}[] = [
  {
    key: "front",
    label: "Front Design",
    storeSlotId: "2",
    tags: ["Front", "front", "FRONT"],
  },
  {
    key: "sleeve",
    label: "Sleeve Design",
    storeSlotId: "4",
    tags: ["Sleeve", "sleeve", "SLEEVE", "Sleeves", "sleeves"],
  },
  {
    key: "back",
    label: "Back Design",
    storeSlotId: "3",
    tags: ["Back", "back", "BACK"],
  },
];

const NECK_TABS = ["Boat Neck", "High Neck", "U Neck", "Collar", "V Neck", "Square Neck"];

function slotKeyFromUrlSlot(slotId?: string): DesignSlotKey {
  if (slotId === "3") return "back";
  if (slotId === "4") return "sleeve";
  if (slotId === "2") return "front";
  const lower = (slotId ?? "").toLowerCase();
  if (lower.includes("back")) return "back";
  if (lower.includes("sleeve")) return "sleeve";
  return "front";
}

interface SelectSleeveDesignContentProps {
  productId?: string;
  returnImage?: string;
  slotId?: string;
  returnTo?: string;
}

export default function SelectSleeveDesignContent({
  productId,
  returnImage,
  slotId,
  returnTo,
}: SelectSleeveDesignContentProps) {
  const router = useRouter();
  const setFrontNeckDesign = useBoutiqueOrderStore((s) => s.setFrontNeckDesign);
  const setSleeveDesign = useBoutiqueOrderStore((s) => s.setSleeveDesign);
  const setSelectedImageForSlot = useBoutiqueOrderStore((s) => s.setSelectedImageForSlot);
  const clearSelectedImageForSlot = useBoutiqueOrderStore((s) => s.clearSelectedImageForSlot);
  const clearSleeveDesign = useBoutiqueOrderStore((s) => s.clearSleeveDesign);
  const clearFrontNeckDesign = useBoutiqueOrderStore((s) => s.clearFrontNeckDesign);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );

  const storeKey = productId ?? "global";
  const slotMap = selectedImageByProductAndSlot[storeKey] ?? {};

  const [activeSlot, setActiveSlot] = useState<DesignSlotKey>(() =>
    slotKeyFromUrlSlot(slotId)
  );
  const [activeNeckTab, setActiveNeckTab] = useState(NECK_TABS[0]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const fileGalleryRef = useRef<HTMLInputElement>(null);
  const fileCameraRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

  const activeMeta = useMemo(
    () => SLOT_META.find((s) => s.key === activeSlot) ?? SLOT_META[0],
    [activeSlot]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      if (replace) {
        setLoading(true);
        setError(false);
      } else {
        setLoadingMore(true);
      }
      try {
        const result = await getDesignsPage({
          page: pageNum,
          limit: 50,
          tags: activeMeta.tags,
          search: debouncedSearch || undefined,
        });
        setTotalPages(result.totalPages || 1);
        setPage(result.page);
        setDesigns((prev) => (replace ? result.data : [...prev, ...result.data]));
      } catch {
        if (replace) {
          setError(true);
          setDesigns([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [activeMeta.tags, debouncedSearch]
  );

  // Reset + load when slot filter or search changes
  useEffect(() => {
    setDesigns([]);
    setPage(1);
    setTotalPages(1);
    void fetchPage(1, true);
  }, [fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (loading || loadingMore || error) return;
        if (page >= totalPages) return;
        void fetchPage(page + 1, false);
      },
      { rootMargin: "240px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, error, fetchPage]);

  const goBackToBoutiques = () => {
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (returnImage) params.set("image", returnImage);
    const fallback =
      returnTo === "addons"
        ? "/addons"
        : params.size > 0
          ? `/select-boutiques?${params.toString()}`
          : "/select-boutiques";
    navigateBack(router, fallback);
  };

  const handleHeaderBack = () => {
    // Don't wipe selections on back — only navigate
    goBackToBoutiques();
  };

  const persistSelection = (imageUrl: string, forSlot: DesignSlotKey) => {
    const meta = SLOT_META.find((s) => s.key === forSlot)!;
    setSelectedImageForSlot(storeKey, meta.storeSlotId, imageUrl);
    if (forSlot === "front") {
      setFrontNeckDesign(imageUrl);
      if (productId) setSleeveDesign(productId, imageUrl);
    } else if (productId && forSlot === "sleeve") {
      setSleeveDesign(productId, imageUrl);
    }
  };

  const clearSlot = (forSlot: DesignSlotKey, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const meta = SLOT_META.find((s) => s.key === forSlot)!;
    clearSelectedImageForSlot(storeKey, meta.storeSlotId);
    if (forSlot === "front") {
      clearFrontNeckDesign();
      if (productId) clearSleeveDesign(productId);
    }
  };

  const handleSelectDesign = (imageUrl: string) => {
    persistSelection(imageUrl, activeSlot);
    // Stay on page so user can fill other slots; optional: navigate after front if came from URL
  };

  const handleDone = () => {
    goBackToBoutiques();
  };

  const openUploadSheet = () => {
    setUploadSheetOpen(true);
  };

  const pickFromGallery = () => {
    setUploadSheetOpen(false);
    // Defer so the sheet closes before the native picker opens on mobile
    requestAnimationFrame(() => fileGalleryRef.current?.click());
  };

  const pickFromCamera = () => {
    setUploadSheetOpen(false);
    requestAnimationFrame(() => fileCameraRef.current?.click());
  };

  const handleFrontSlotClick = () => {
    if (activeSlot !== "front") {
      // First click: only select / activate the slot
      setActiveSlot("front");
      return;
    }
    // Second click while already selected: open Camera / Gallery options
    openUploadSheet();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    persistSelection(objectUrl, "front");
    setActiveSlot("front");
    e.target.value = "";
  };

  const getSlotImage = (key: DesignSlotKey) => {
    const meta = SLOT_META.find((s) => s.key === key)!;
    return slotMap[meta.storeSlotId];
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <button
            type="button"
            onClick={handleHeaderBack}
            className={styles.backBtn}
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Select Sleeve Design</h1>
            <p className={styles.subtitle}>Select Design or Upload Your Own</p>
          </div>
          <button type="button" className={styles.doneBtn} onClick={handleDone}>
            Done
          </button>
        </div>

        <div className={styles.searchBar}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search designs"
          />
        </div>

        <div className={styles.tabs} role="tablist">
          {NECK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className={`${styles.tab} ${activeNeckTab === tab ? styles.tabActive : ""}`}
              aria-selected={activeNeckTab === tab}
              onClick={() => setActiveNeckTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.slotsRow}>
        {SLOT_META.map((slot) => {
          const img = getSlotImage(slot.key);
          const isActive = activeSlot === slot.key;
          const isFrontUpload = slot.key === "front" && !img;

          return (
            <button
              key={slot.key}
              type="button"
              className={`${styles.slotCard} ${isActive ? styles.slotCardActive : ""}`}
              onClick={() => {
                if (slot.key === "front") {
                  handleFrontSlotClick();
                  return;
                }
                setActiveSlot(slot.key);
              }}
              aria-pressed={isActive}
            >
              <div className={styles.slotMedia}>
                {img ? (
                  <>
                    <Image
                      src={img}
                      alt=""
                      fill
                      className={styles.slotImage}
                      sizes="33vw"
                    />
                    <span
                      className={styles.slotClear}
                      role="button"
                      tabIndex={0}
                      aria-label={`Clear ${slot.label}`}
                      onClick={(e) => clearSlot(slot.key, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          clearSlot(slot.key);
                        }
                      }}
                    >
                      ×
                    </span>
                  </>
                ) : isFrontUpload ? (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadPlus}>+</span>
                    <span className={styles.uploadText}>Upload photo</span>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadPlus}>+</span>
                    <span className={styles.uploadText}>Select</span>
                  </div>
                )}
              </div>
              <span className={styles.slotLabel}>{slot.label}</span>
            </button>
          );
        })}
        <input
          ref={fileGalleryRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-hidden
          tabIndex={-1}
        />
        <input
          ref={fileCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-hidden
          tabIndex={-1}
        />
      </div>

      <BottomSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        title="Upload photo"
      >
        <div className={styles.uploadOptions}>
          <button type="button" className={styles.uploadOptionBtn} onClick={pickFromCamera}>
            <span className={styles.uploadOptionIcon} aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
            Camera
          </button>
          <button type="button" className={styles.uploadOptionBtn} onClick={pickFromGallery}>
            <span className={styles.uploadOptionIcon} aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </span>
            Gallery
          </button>
        </div>
      </BottomSheet>

      <div className={styles.filterHint}>
        Showing <strong>{activeMeta.label}</strong> designs
      </div>

      <div className={styles.grid}>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <article key={`skel-${i}`} className={styles.card}>
              <div className={`${styles.cardImage} shimmer`} />
              <div className={`${styles.cardLabelSkeleton} shimmer`} />
            </article>
          ))}

        {!loading && error && (
          <p className={styles.errorMsg}>Failed to load designs. Please try again.</p>
        )}

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
              <div className={styles.cardLabel}>{design.designName}</div>
            </article>
          ))}

        {!loading && !error && designs.length === 0 && (
          <p className={styles.errorMsg}>No designs for this filter.</p>
        )}
      </div>

      <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden />
      {loadingMore ? <p className={styles.loadingMore}>Loading more…</p> : null}
    </div>
  );
}
