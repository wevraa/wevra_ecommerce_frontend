import Link from "next/link";
import styles from "./MeasurementAddonsRows.module.scss";
import { buildAddonsHref } from "@/lib/addonsNavigation";

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
  const addonsHref = buildAddonsHref({
    returnTo: "select-boutiques",
    productId,
    productImage,
  });

  return (
    <section className={styles.section}>
      <Link href={buildHref("/measurement", productId, productImage)} className={styles.row}>
        <span className={styles.label}>MEASUREMENT</span>
        <span className={styles.chevron} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Link>
      <Link href={addonsHref} className={styles.row}>
        <span className={styles.label}>Add ons</span>
        <span className={styles.chevron} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Link>
    </section>
  );
}
