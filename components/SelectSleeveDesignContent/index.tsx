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
  const [previewDesign, setPreviewDesign] = useState<ApiDesign | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectAnimating, setSelectAnimating] = useState(false);
  const [flyImageUrl, setFlyImageUrl] = useState<string | null>(null);
  const [previewClosing, setPreviewClosing] = useState(false);
  const [previewNavKey, setPreviewNavKey] = useState(0);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

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

  const openDesignPreview = (design: ApiDesign, asNextScreen = false) => {
    const switching = Boolean(previewDesign) && previewDesign?.id !== design.id;
    setSelectAnimating(false);
    setFlyImageUrl(null);
    setPreviewClosing(false);
    setPreviewDesign(design);
    setPreviewImageUrl(design.imageUrl);
    if (switching || asNextScreen) {
      setPreviewNavKey((k) => k + 1);
    }
    // Jump to top instantly — feels like a new screen, not a scroll
    requestAnimationFrame(() => {
      if (previewScrollRef.current) previewScrollRef.current.scrollTop = 0;
    });
  };

  const closeDesignPreview = () => {
    if (selectAnimating || previewClosing) return;
    setPreviewClosing(true);
    window.setTimeout(() => {
      setPreviewDesign(null);
      setPreviewImageUrl(null);
      setFlyImageUrl(null);
      setSelectAnimating(false);
      setPreviewClosing(false);
    }, 260);
  };

  const previewGallery = useMemo(() => {
    if (!previewDesign) return [] as string[];
    const urls = [
      previewDesign.imageUrl,
      ...(previewDesign.imageUrls ?? []),
    ].filter(Boolean);
    return Array.from(new Set(urls));
  }, [previewDesign]);

  const relatedDesigns = useMemo(() => {
    if (!previewDesign) return [] as ApiDesign[];
    return designs.filter((d) => d.id !== previewDesign.id).slice(0, 8);
  }, [designs, previewDesign]);

  const confirmPreviewSelection = () => {
    const url = previewImageUrl ?? previewDesign?.imageUrl;
    if (!url || selectAnimating) return;
    setSelectAnimating(true);
    setFlyImageUrl(url);
    persistSelection(url, activeSlot);
    window.setTimeout(() => {
      setSelectAnimating(false);
      setFlyImageUrl(null);
      setPreviewDesign(null);
      setPreviewImageUrl(null);
    }, 700);
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

  const handleSlotClick = (key: DesignSlotKey) => {
    if (activeSlot !== key) {
      // First click: only select / activate the slot
      setActiveSlot(key);
      return;
    }
    // Already selected: open Camera / Gallery options
    openUploadSheet();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    persistSelection(objectUrl, activeSlot);
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

          return (
            <button
              key={slot.key}
              type="button"
              className={`${styles.slotCard} ${isActive ? styles.slotCardActive : ""}`}
              onClick={() => handleSlotClick(slot.key)}
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
                      unoptimized={img.startsWith("blob:")}
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
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadPlus}>+</span>
                    <span className={styles.uploadText}>Upload photo</span>
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
        title={`Upload ${activeMeta.label}`}
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
              onClick={() => openDesignPreview(design)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDesignPreview(design);
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

      {previewDesign && previewImageUrl ? (
        <div
          key={`${previewDesign.id}-${previewNavKey}`}
          ref={previewScrollRef}
          className={`${styles.previewOverlay} ${
            previewClosing ? styles.previewExit : styles.previewEnter
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={previewDesign.designName}
        >
          <button
            type="button"
            className={styles.previewBack}
            onClick={closeDesignPreview}
            aria-label="Close preview"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className={styles.previewHero}>
            <Image
              src={previewImageUrl}
              alt={previewDesign.designName}
              fill
              className={styles.previewHeroImg}
              sizes="100vw"
              priority
            />
          </div>

          <div className={styles.previewBody}>
            <div className={styles.previewMeta}>
              <div className={styles.previewMetaText}>
                <p className={styles.previewCategory}>
                  {previewDesign.subcategory?.name || previewDesign.category?.name || activeMeta.label}
                </p>
                <h2 className={styles.previewTitle}>{previewDesign.designName}</h2>
              </div>
              <button
                type="button"
                className={`${styles.previewSelectBtn} ${selectAnimating ? styles.previewSelectBtnActive : ""}`}
                onClick={confirmPreviewSelection}
                disabled={selectAnimating}
              >
                {selectAnimating ? "Selected" : "Select"}
              </button>
            </div>

            {previewGallery.length > 1 ? (
              <div className={styles.previewThumbs} role="list">
                {previewGallery.map((url) => (
                  <button
                    key={url}
                    type="button"
                    role="listitem"
                    className={`${styles.previewThumb} ${previewImageUrl === url ? styles.previewThumbActive : ""}`}
                    onClick={() => setPreviewImageUrl(url)}
                    aria-label="View design image"
                  >
                    <Image src={url} alt="" fill className={styles.previewThumbImg} sizes="72px" />
                  </button>
                ))}
              </div>
            ) : null}

            {relatedDesigns.length > 0 ? (
              <div className={styles.relatedSection}>
                <h3 className={styles.relatedTitle}>More to explore</h3>
                <div className={styles.relatedGrid}>
                  {relatedDesigns.map((design) => (
                    <button
                      key={design.id}
                      type="button"
                      className={styles.relatedCard}
                      onClick={() => openDesignPreview(design, true)}
                      aria-label={design.designName}
                    >
                      <Image
                        src={design.imageUrl}
                        alt=""
                        fill
                        className={styles.relatedImg}
                        sizes="50vw"
                      />
                      <span className={styles.relatedHeart} aria-hidden>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {flyImageUrl ? (
            <div className={styles.flyAway} aria-hidden>
              <Image src={flyImageUrl} alt="" fill className={styles.flyAwayImg} sizes="120px" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
