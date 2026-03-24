"use client";

import type { ApiTailor } from "@/lib/api";
import styles from "./TailorCard.module.scss";
import { useRouter } from "next/navigation";

interface TailorCardProps {
  tailor: ApiTailor;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionDisabled?: boolean;
}

export default function TailorCard({
  tailor,
  isSelected,
  onToggleSelect,
  selectionDisabled,
}: TailorCardProps) {
  const router = useRouter();
  const initial = tailor.name.charAt(0).toUpperCase();
  const specializations = tailor.specializations?.length
    ? tailor.specializations
    : tailor.categoryTags?.length
      ? tailor.categoryTags
      : [];

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden>
          {initial}
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.name}>{tailor.name}</h3>
          <span className={styles.experience}>
            {tailor.experience}{" "}
            {Number(tailor.experience) === 1 ? "year" : "years"} experience
          </span>
        </div>
        <div className={styles.headerRight}>
          <span
            className={`${styles.status} ${tailor.status === "ACTIVE" ? styles.statusActive : styles.statusInactive}`}
          >
            {tailor.status}
          </span>
          {isSelected && (
            <span className={styles.selectedBadge} aria-label="Selected">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {specializations.length > 0 && (
        <div className={styles.tags}>
          {specializations.slice(0, 5).map((s) => (
            <span key={s} className={styles.tag}>
              {s}
            </span>
          ))}
          {specializations.length > 5 && (
            <span className={styles.tagMore}>
              +{specializations.length - 5}
            </span>
          )}
        </div>
      )}

      {tailor.addressLine1 && (
        <p className={styles.address}>
          {tailor.addressLine1}
          {tailor.addressLine2 ? `, ${tailor.addressLine2}` : ""}
        </p>
      )}
      {tailor.pincode && (
        <p className={styles.pincode}>Pincode: {tailor.pincode}</p>
      )}

      <div className={styles.footer}>
        {tailor.phone && (
          <a href={`tel:${tailor.phone}`} className={styles.contactLink}>
            {tailor.phone}
          </a>
        )}
        <div className={styles.footerBtns}>
          <button
            type="button"
            className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ""}`}
            onClick={onToggleSelect}
            disabled={selectionDisabled}
            aria-pressed={isSelected}
          >
            {isSelected ? "Selected ✓" : "Select"}
          </button>
          <button
            type="button"
            className={styles.viewBtn}
            onClick={() => router.push("/boutiques-selection")}
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
