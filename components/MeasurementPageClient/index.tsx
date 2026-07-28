"use client";

import { useEffect, useMemo, useState } from "react";
import MeasurementHeader from "@/components/MeasurementHeader";
import MeasurementList from "@/components/MeasurementList";
import MeasurementModel from "@/components/MeasurementModel";
import {
  getMeasurementPresets,
  presetToMeasurementItems,
  type ApiMeasurementPreset,
} from "@/lib/api";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./MeasurementPageClient.module.scss";

interface MeasurementPageClientProps {
  subcategoryIdFromUrl?: string;
}

export default function MeasurementPageClient({
  subcategoryIdFromUrl,
}: MeasurementPageClientProps) {
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);

  const subcategoryId = subcategoryIdFromUrl || orderContext.orderTypeId;

  const [presets, setPresets] = useState<ApiMeasurementPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const nextItems = presetToMeasurementItems(preset);
    setOrderContext({
      selectedSize: preset.label,
      selectedPresetId: preset.id,
      measurements: nextItems.map((m) => ({
        name: m.name,
        value: m.value,
        unit: m.unit || "INCHES",
      })),
      hasMeasurementSelected: true,
    });
  };

  return (
    <>
      <MeasurementHeader sizeLabel={activePreset?.label} />
      <main className={`${styles.main} main-with-bottom-nav`}>
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
              <div className={styles.sizeRow} role="radiogroup" aria-label="Select size preset">
                {presets.map((preset) => {
                  const active = activePreset?.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.sizeChip} ${active ? styles.sizeChipActive : ""}`}
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
                  <MeasurementList key={activePreset?.id ?? "none"} items={items} />
                ) : (
                  <p className={styles.message}>No measurements for this size.</p>
                )}
              </div>
              <div className={styles.right}>
                <MeasurementModel />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
