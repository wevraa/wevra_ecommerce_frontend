"use client";

import styles from "./ProductDetailActions.module.scss";

interface ProductDetailActionsProps {
  onAddToBag?: () => void;
}

export default function ProductDetailActions({ onAddToBag }: ProductDetailActionsProps) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.buyNow}>
        BUY NOW
      </button>
      <button type="button" className={styles.addToBag} onClick={onAddToBag}>
        ADD TO BAG
      </button>
    </div>
  );
}
