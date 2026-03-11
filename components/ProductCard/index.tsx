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
            <Image src={measure} alt="measure" />
          </span>
        </Link>

        <section className={styles.product_info}>
          <div className={styles.body}>
            {showShortDescription !== false && (
              <p className={styles.shortDescription}>{product.shortDescription}</p>
            )}
            <div className={styles.brand}>
              <span>{product.brand}</span>
            </div>
            <p className={styles.price}>{formatPrice(product.price)}</p>
          </div>
          <div
           
            className={styles.addbtn}
            onClick={() => setIsSizeSheetOpen(true)}
            aria-label="Select size"
          >
            <Image src={add} alt="add" />
          </div>
        </section>
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
