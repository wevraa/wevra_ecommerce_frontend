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

function StraightenIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h1.5v4h1.5V8H7v4h1.5V8H10v4h1.5V8H13v4h1.5V8H16v4h1.5V8H19v4h1.5V8H21v8z" />
    </svg>
  );
}

function ExpandMoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function AddCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
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
            <span className={styles.measureIcon}>
              <StraightenIcon />
            </span>
            Measurements
          </span>
          <span
            className={`${styles.chevronDown} ${open ? styles.chevronOpen : ""}`}
            aria-hidden
          >
            <ExpandMoreIcon />
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
                    <span>{size.label}</span>
                    {active ? (
                      <span className={styles.sizeIcon}>
                        <StraightenIcon size={14} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <Link href={measurementHref} className={styles.actionLink}>
                <InfoIcon />
                More Details
              </Link>
              <Link href={measurementHref} className={styles.actionLink}>
                <EditIcon />
                Edit
              </Link>
            </div>
          </>
        ) : null}
      </div>

      <Link href={addonsHref} className={styles.addonsRow}>
        <span className={styles.addonsLeft}>
          <span className={styles.plusIcon}>
            <AddCircleIcon />
          </span>
          <span className={styles.addonsLabel}>Add-ons</span>
        </span>
        <span className={styles.addonsRight}>
          {addonsCount > 0 ? (
            <span className={styles.newBadge}>{addonsCount}</span>
          ) : null}
          <span className={styles.chevronRight}>
            <ChevronRightIcon />
          </span>
        </span>
      </Link>
    </section>
  );
}
