"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./ProductImageCarousel.module.scss";
import measure from "../../app/assests/icons/measure.svg";
import { getAccessToken } from "@/lib/auth";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  productIdsInWishlist,
} from "@/lib/wishlist";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  productId?: string;
}

export default function ProductImageCarousel({ images, alt, productId }: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const list = images.length ? images : ["/images/placeholder-rect.svg"];
  const goPrev = () => setIndex((i) => (i === 0 ? list.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === list.length - 1 ? 0 : i + 1));
  const router = useRouter();

  const syncWishlistState = useCallback(async () => {
    if (!productId || !getAccessToken()) {
      setInWishlist(false);
      return;
    }
    try {
      const items = await getWishlist();
      setInWishlist(productIdsInWishlist(items).has(productId));
    } catch {
      setInWishlist(false);
    }
  }, [productId]);

  useEffect(() => {
    syncWishlistState();
  }, [syncWishlistState]);

  useEffect(() => {
    const onChange = () => syncWishlistState();
    window.addEventListener("auth-changed", onChange);
    window.addEventListener("wishlist-changed", onChange);
    return () => {
      window.removeEventListener("auth-changed", onChange);
      window.removeEventListener("wishlist-changed", onChange);
    };
  }, [syncWishlistState]);

  const onWishlistClick = async () => {
    if (!productId) return;
    if (!getAccessToken()) {
      window.dispatchEvent(new CustomEvent("open-login"));
      return;
    }
    setWishBusy(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setInWishlist(false);
      } else {
        await addToWishlist(productId);
        setInWishlist(true);
      }
    } catch {
      /* keep state; user can retry */
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.slideActive}>
        <Image src={list[index]} alt={index === 0 ? alt : `${alt} view ${index + 1}`} fill className={styles.image} sizes="100vw" />
      </div>
      {list.length > 1 && (
        <>
          <button type="button" className={styles.prevBtn} onClick={goPrev} aria-label="Previous image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className={styles.nextBtn} onClick={goNext} aria-label="Next image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
      {productId && (
        <button
          type="button"
          className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ""}`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
          disabled={wishBusy}
          onClick={onWishlistClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}
      <div
        className={styles.sizeChartBtn}
        role="button"
        tabIndex={0}
        aria-label="Size chart"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const image = list[index];
            const params = new URLSearchParams();
            if (productId) params.set("productId", productId);
            if (image) params.set("image", image);
            router.push(`/select-boutiques?${params.toString()}`);
          }
        }}
        onClick={() => {
          const image = list[index];
          const params = new URLSearchParams();
          if (productId) params.set("productId", productId);
          if (image) params.set("image", image);
          router.push(`/select-boutiques?${params.toString()}`);
        }}
      >
        <Image src={measure} alt="measure" />
      </div>
      <div className={styles.indicators} role="tablist">
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`${styles.bar} ${i === index ? styles.active : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
