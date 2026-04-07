"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiAccessoryOption } from "@/lib/api";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import styles from "./AddonsForm.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wevraa.in/api";

type GarmentView = "back" | "front" | "side";

const VIEWS: { key: GarmentView; label: string }[] = [
  { key: "back", label: "Back" },
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
];

const emptyDrawings: Record<GarmentView, string | null> = {
  back: null,
  front: null,
  side: null,
};

export default function AddonsForm() {
  const router = useRouter();
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );
  const [accessoryOptions, setAccessoryOptions] = useState<ApiAccessoryOption[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [activeView, setActiveView] = useState<GarmentView>("front");
  const [drawingPreviews, setDrawingPreviews] =
    useState<Record<GarmentView, string | null>>(emptyDrawings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingPreviewsRef = useRef(drawingPreviews);
  drawingPreviewsRef.current = drawingPreviews;

  useEffect(() => {
    const hasAny = Object.values(selected).some(Boolean);
    setOrderContext({ hasAddonsSelected: hasAny });
  }, [selected, setOrderContext]);

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    fetch(`${API_BASE}/v1/addon/accessory-options`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: unknown) => {
        const raw = Array.isArray(json) ? json : (json as { data?: unknown[] })?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const options: ApiAccessoryOption[] = list.map((item: unknown, index: number) => {
          const o = item as Record<string, unknown>;
          const id = typeof o.id === "string" ? o.id : `opt-${index}`;
          const name = typeof o.name === "string" ? o.name : "";
          return { id, name };
        }).filter((o) => o.name);
        setAccessoryOptions(options);
        setSelected((prev) => {
          const next = { ...prev };
          for (const opt of options) {
            if (next[opt.id] === undefined) next[opt.id] = true;
          }
          return next;
        });
      })
      .catch(() => setAccessoryOptions([]))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(drawingPreviewsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleDrawingPickClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrawingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setDrawingPreviews((prev) => {
      const old = prev[activeView];
      if (old) URL.revokeObjectURL(old);
      return {
        ...prev,
        [activeView]: URL.createObjectURL(file),
      };
    });
  };

  const currentDrawing = drawingPreviews[activeView];
  const hangingSlotId = `hanging-${activeView}`;
  const hangingImage = selectedImageByProductAndSlot.global?.[hangingSlotId] ?? null;

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.intro}>Select Which you required</p>

        {loaded && accessoryOptions.length === 0 ? (
          <p className={styles.intro}>No accessory options available.</p>
        ) : null}
        {!loaded ? (
          <p className={styles.intro}>Loading accessory options…</p>
        ) : (
          accessoryOptions.map((option) => (
            <div key={option.id} className={styles.row}>
              <span className={styles.label}>{option.name}</span>
              <button
                type="button"
                role="switch"
                aria-checked={!!selected[option.id]}
                className={`${styles.toggle} ${selected[option.id] ? styles.on : ""}`}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
                }
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))
        )}

        <div className={styles.segmentWrap}>
          <div className={styles.segment} role="tablist" aria-label="Garment view">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeView === key}
                className={`${styles.segmentBtn} ${activeView === key ? styles.selected : ""}`}
                onClick={() => setActiveView(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.twoCol}>
          <div>
            <h2 className={styles.sectionTitle}>HANGINGS</h2>
            <p className={styles.subtitle}>
              Select or upload hangings or else leave blank
            </p>
            <button
              type="button"
              className={`${styles.uploadCard} ${styles.uploadCardButton}`}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("slot", hangingSlotId);
                params.set("returnTo", "addons");
                router.push(`/select-sleeve-design?${params.toString()}`);
              }}
              aria-label={`Select hanging design for ${activeView} view`}
            >
              {hangingImage ? (
                <img
                  src={hangingImage}
                  alt={`Hanging preview (${activeView})`}
                  className={styles.uploadPreview}
                />
              ) : (
                <span aria-hidden>🎀</span>
              )}
            </button>
          </div>

          <div>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMuted}`}>
              DRAWING IMAGE
            </h2>
            <p className={styles.subtitle}>
              Upload your drawing pattern if required
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenFileInput}
              aria-hidden
              tabIndex={-1}
              onChange={handleDrawingFileChange}
            />
            <button
              type="button"
              className={`${styles.uploadCard} ${styles.uploadCardButton}`}
              onClick={handleDrawingPickClick}
              aria-label={`Select drawing image for ${activeView} view`}
            >
              {currentDrawing ? (
                <img
                  src={currentDrawing}
                  alt={`Drawing preview (${activeView})`}
                  className={styles.uploadPreview}
                />
              ) : (
                <span className={styles.uploadPlus} aria-hidden>
                  +
                </span>
              )}
            </button>
          </div>
        </div>

        <Link href="/profile" className={styles.cta}>
          CONTINUE TO ORDER
        </Link>
      </div>
    </div>
  );
}
