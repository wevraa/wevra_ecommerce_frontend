"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MeasurementHeader from "@/components/MeasurementHeader";
import MeasurementList from "@/components/MeasurementList";
import MeasurementModel from "@/components/MeasurementModel";
import type { MeasurementItem } from "@/data/measurement";
import {
  getMeasurementPresets,
  presetToMeasurementItems,
  type ApiMeasurementPreset,
} from "@/lib/api";
import { navigateBack } from "@/lib/navigateBack";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./MeasurementPageClient.module.scss";

interface MeasurementPageClientProps {
  subcategoryIdFromUrl?: string;
}

type DraftMeasurement = { name: string; value: number; unit: string };

export default function MeasurementPageClient({
  subcategoryIdFromUrl,
}: MeasurementPageClientProps) {
  const router = useRouter();
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);

  const subcategoryId = subcategoryIdFromUrl || orderContext.orderTypeId;

  const [presets, setPresets] = useState<ApiMeasurementPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MeasurementItem | null>(null);
  const [draftMeasurements, setDraftMeasurements] = useState<DraftMeasurement[]>(
    []
  );

  useEffect(() => {
    if (!subcategoryId) {
      setPresets([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMeasurementPresets(subcategoryId, true)
      .then((data) => {
        if (cancelled) return;
        setPresets(data);
        const preferred =
          data.find((p) => p.id === orderContext.selectedPresetId) ??
          data.find((p) => p.label === orderContext.selectedSize);
        if (preferred) {
          setOrderContext({
            selectedSize: preferred.label,
            selectedPresetId: preferred.id,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPresets([]);
          setError("Failed to load measurement presets.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategoryId]);

  const activePreset = useMemo(() => {
    if (!presets.length) return undefined;
    return (
      presets.find((p) => p.id === orderContext.selectedPresetId) ??
      presets.find((p) => p.label === orderContext.selectedSize) ??
      presets[0]
    );
  }, [presets, orderContext.selectedPresetId, orderContext.selectedSize]);

  const items = useMemo(
    () => presetToMeasurementItems(activePreset),
    [activePreset]
  );

  const selectPreset = (preset: ApiMeasurementPreset) => {
    setOrderContext({
      selectedSize: preset.label,
      selectedPresetId: preset.id,
    });
  };

  const handleActiveChange = useCallback((item: MeasurementItem | null) => {
    setActiveItem(item);
  }, []);

  const handleDraftChange = useCallback((measurements: DraftMeasurement[]) => {
    setDraftMeasurements(measurements);
  }, []);

  const handleSave = () => {
    const measurements =
      draftMeasurements.length > 0
        ? draftMeasurements
        : items.map((m) => ({
            name: m.name,
            value: m.value,
            unit: m.unit || "INCHES",
          }));

    setOrderContext({
      selectedSize: activePreset?.label ?? orderContext.selectedSize,
      selectedPresetId: activePreset?.id ?? orderContext.selectedPresetId,
      measurements,
      hasMeasurementSelected: measurements.length > 0,
    });

    const params = new URLSearchParams();
    if (orderContext.productId) params.set("productId", orderContext.productId);
    if (orderContext.productImage) params.set("image", orderContext.productImage);
    const fallback =
      params.size > 0
        ? `/select-boutiques?${params.toString()}`
        : "/select-boutiques";
    navigateBack(router, fallback);
  };

  return (
    <div className={styles.page}>
      <MeasurementHeader sizeLabel={activePreset?.label} />
      <main className={styles.main}>
        {!subcategoryId ? (
          <p className={styles.message}>
            Select an order type on Custom Order first to load measurement presets.
          </p>
        ) : loading ? (
          <p className={styles.message}>Loading measurements…</p>
        ) : error ? (
          <p className={styles.message} role="alert">
            {error}
          </p>
        ) : (
          <>
            {presets.length > 0 ? (
              <div
                className={styles.sizeRow}
                role="radiogroup"
                aria-label="Select size preset"
              >
                {presets.map((preset) => {
                  const active = activePreset?.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.sizeChip} ${
                        active ? styles.sizeChipActive : ""
                      }`}
                      aria-pressed={active}
                      onClick={() => selectPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className={styles.message}>No size presets for this order type.</p>
            )}

            <div className={styles.content}>
              <div className={styles.left}>
                {items.length > 0 ? (
                  <MeasurementList
                    key={activePreset?.id ?? "none"}
                    items={items}
                    onActiveChange={handleActiveChange}
                    onDraftChange={handleDraftChange}
                  />
                ) : (
                  <p className={styles.message}>No measurements for this size.</p>
                )}
              </div>
              <div className={styles.right}>
                <MeasurementModel
                  imageUrl={activeItem?.imageUrl}
                  label={activeItem?.name}
                />
              </div>
            </div>

            {items.length > 0 ? (
              <div className={styles.saveBar}>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
