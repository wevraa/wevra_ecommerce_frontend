"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/dummy";
import styles from "./ProductCard.module.scss";
import measure from "../../app/assests/icons/measure.svg";
import add from "../../app/assests/icons/add.svg";
import BottomSheet from "@/components/BottomSheet";
import SizeBottomSheet from "@/components/SizeBottomSheet";

interface ProductCardProps {
  product: Product;
  showShortDescription?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, showShortDescription }: ProductCardProps) {
  const [isSizeSheetOpen, setIsSizeSheetOpen] = useState(false);
  const showDesc = showShortDescription !== false;

  return (
    <>
      <article className={styles.card}>
        <Link href={`/product/${product.id}`} className={styles.imageWrap}>
          <Image
            src={product.image}
            alt={product.alt}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <span className={styles.overlayIcon} aria-hidden>
            <Image src={measure} alt="" width={18} height={18} />
          </span>
        </Link>

        <div className={styles.body}>
          <div className={styles.topRow}>
            {showDesc ? (
              <p className={styles.shortDescription}>{product.shortDescription}</p>
            ) : (
              <span className={styles.topRowSpacer} />
            )}
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => setIsSizeSheetOpen(true)}
              aria-label="Select size"
            >
              <Image src={add} alt="" width={16} height={16} />
            </button>
          </div>
          <Link href={`/product/${product.id}`} className={styles.metaLink}>
            <p className={styles.brand}>{product.brand}</p>
            <p className={styles.price}>{formatPrice(product.price)}</p>
          </Link>
        </div>
      </article>

      <BottomSheet
        open={isSizeSheetOpen}
        onClose={() => setIsSizeSheetOpen(false)}
        title="Select Size"
      >
        <SizeBottomSheet />
      </BottomSheet>
    </>
  );
}
