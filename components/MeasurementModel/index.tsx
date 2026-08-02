"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./MeasurementModel.module.scss";
import measurementModal from "../../app/assests/icons/modal.svg";

interface MeasurementModelProps {
  imageUrl?: string | null;
  label?: string;
}

export default function MeasurementModel({
  imageUrl,
  label,
}: MeasurementModelProps) {
  const src = imageUrl?.trim() || measurementModal;
  const isRemote = typeof src === "string" && /^https?:\/\//i.test(src);
  const imageKey = isRemote ? src : "fallback";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [imageKey]);

  return (
    <div className={styles.wrap}>
      <div className={styles.scrollHint} aria-label="Scroll ruler to select value">
        <span className={styles.scrollHintArrow} aria-hidden>
          ←
        </span>
        <span className={styles.scrollHintText}>Scroll to Select</span>
      </div>
      <div className={styles.imageWrap}>
        {loading ? (
          <div className={`${styles.shimmer} shimmer`} aria-hidden />
        ) : null}
        <Image
          key={imageKey}
          src={src}
          alt={label ? `${label} measurement guide` : "Body measurement guide"}
          width={280}
          height={373}
          className={`${styles.image} ${loading ? styles.imageLoading : ""}`}
          priority
          unoptimized={isRemote}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
