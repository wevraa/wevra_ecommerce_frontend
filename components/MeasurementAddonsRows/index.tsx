"use client";

import Link from "next/link";
import { useState } from "react";
import { blouseSizes } from "@/data/dummy";
import { buildAddonsHref } from "@/lib/addonsNavigation";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import styles from "./MeasurementAddonsRows.module.scss";

interface MeasurementAddonsRowsProps {
  productId?: string;
  productImage?: string;
}

function buildHref(path: string, productId?: string, productImage?: string): string {
  const params = new URLSearchParams();
  if (productId) params.set("productId", productId);
  if (productImage) params.set("image", productImage);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export default function MeasurementAddonsRows({
  productId,
  productImage,
}: MeasurementAddonsRowsProps) {
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const [open, setOpen] = useState(true);

  const resolvedProductId = productId ?? orderContext.productId;
  const resolvedProductImage = productImage ?? orderContext.productImage;
  const selectedSize = orderContext.selectedSize ?? "38";
  const addonsCount = orderContext.addons?.length ?? 0;

  const addonsHref = buildAddonsHref({
    returnTo: "select-boutiques",
    productId: resolvedProductId,
    productImage: resolvedProductImage,
  });
  const measurementHref = buildHref(
    "/measurement",
    resolvedProductId,
    resolvedProductImage
  );

  return (
    <section className={styles.section}>
      <div className={styles.measurementsCard}>
        <button
          type="button"
          className={styles.measurementsHeader}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.measurementsTitle}>
            <span className={styles.measureIcon} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12h20" />
                <path d="M6 8v8" />
                <path d="M10 10v4" />
                <path d="M14 8v8" />
                <path d="M18 10v4" />
              </svg>
            </span>
            Measurements
          </span>
          <span
            className={`${styles.chevronDown} ${open ? styles.chevronOpen : ""}`}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {open ? (
          <>
            <div className={styles.sizeRow} role="radiogroup" aria-label="Select size">
              {blouseSizes.map((size) => {
                const active = selectedSize === size.label;
                return (
                  <button
                    key={size.id}
                    type="button"
                    className={`${styles.sizeBtn} ${active ? styles.sizeActive : ""}`}
                    aria-pressed={active}
                    onClick={() => setOrderContext({ selectedSize: size.label })}
                  >
                    {active ? (
                      <svg
                        className={styles.sizeIcon}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M2 12h20" />
                        <path d="M6 8v8" />
                        <path d="M10 10v4" />
                        <path d="M14 8v8" />
                        <path d="M18 10v4" />
                      </svg>
                    ) : null}
                    {size.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <Link href={measurementHref} className={styles.actionLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                More Details
              </Link>
              <Link href={measurementHref} className={styles.actionLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Edit
              </Link>
            </div>
          </>
        ) : null}
      </div>

      <Link href={addonsHref} className={styles.addonsRow}>
        <span className={styles.addonsLeft}>
          <span className={styles.plusIcon} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </span>
          <span className={styles.addonsLabel}>Add-ons</span>
          {addonsCount > 0 ? (
            <span className={styles.newBadge}>{addonsCount}</span>
          ) : null}
        </span>
        <span className={styles.chevronRight} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Link>
    </section>
  );
}
