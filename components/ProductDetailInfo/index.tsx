"use client";

import { useState } from "react";
import { sizes, sizeMeasurements } from "@/data/dummy";
import type { SizeOption } from "@/data/dummy";
import styles from "./ProductDetailInfo.module.scss";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

const sizeSubset: SizeOption[] = sizes.filter((s) =>
  ["xs", "s", "m", "l", "xl", "2xl"].includes(s.id)
);

interface ProductDetailInfoProps {
  brand: string;
  price: number;
  description?: string;
}

export default function ProductDetailInfo({
  brand,
  price,
  description,
}: ProductDetailInfoProps) {
  const [selectedSize, setSelectedSize] = useState("s");
  const desc = description?.trim();

  return (
    <div className={styles.section}>
      <h1 className={styles.brand}>{brand}</h1>
      {desc ? <p className={styles.description}>{desc}</p> : null}
      <p className={styles.price}>{formatPrice(price)}</p>
      <p className={styles.sizeTitle}>Size</p>
      <div className={styles.sizeRow} role="group">
        {sizeSubset.map((size) => (
          <button
            key={size.id}
            type="button"
            className={`${styles.sizeBtn} ${selectedSize === size.id ? styles.active : ""}`}
            onClick={() => setSelectedSize(size.id)}
            aria-pressed={selectedSize === size.id}
          >
            {size.label}
          </button>
        ))}
      </div>
      <p className={styles.measurements}>
        Bust : {sizeMeasurements.bust} Waist : {sizeMeasurements.waist} Hip :{" "}
        {sizeMeasurements.hip}
      </p>
    </div>
  );
}
