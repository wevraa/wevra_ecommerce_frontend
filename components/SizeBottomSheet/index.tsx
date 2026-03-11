"use client";

import { useState } from "react";
import { sizes, sizeMeasurements } from "@/data/dummy";
import styles from "./SizeBottomSheet.module.scss";

export default function SizeBottomSheet() {
  const [selectedSize, setSelectedSize] = useState("s");

  return (
    <div className={styles.wrap}>
      {/* <h3 className={styles.title}>SELECT SIZE</h3> */}
      <div className={styles.sizeGrid} role="radiogroup" aria-label="Select size">
        {sizes.map((size) => (
          <button
            key={size.id}
            type="button"
            className={`${styles.sizeBtn} ${
              selectedSize === size.id ? styles.active : ""
            }`}
            onClick={() => setSelectedSize(size.id)}
            aria-pressed={selectedSize === size.id}
          >
            {size.label}
          </button>
        ))}
      </div>
      <div className={styles.divider} />
      <p className={styles.measurements}>
        Bust : {sizeMeasurements.bust}&nbsp;&nbsp; Waist : {sizeMeasurements.waist}
        &nbsp;&nbsp; Hip : {sizeMeasurements.hip}
      </p>
    </div>
  );
}

