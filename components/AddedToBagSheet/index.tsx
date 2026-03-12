"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AddedToBagSheet.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface RecommendedProduct {
  id: string;
  title: string;
  image?: string | null;
  finalPrice?: string | null;
}

export default function AddedToBagSheet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendedProduct[]>([]);

  useEffect(() => {
    if (!API_BASE) return;
    setLoading(true);
    fetch(`${API_BASE}/v1/products?limit=6`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any) => {
        if (Array.isArray(data)) {
          const mapped = data.slice(0, 6).map((p) => ({
            id: p.id,
            title: p.title,
            image: p.media?.[0]?.url ?? null,
            finalPrice: p.finalPrice,
          }));
          setItems(mapped);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (value?: string | null) => {
    const num = Number(value ?? 0) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.addedText}>
          <span className={styles.emoji} aria-hidden>
            🛍️
          </span>
          <span>Added to bag!</span>
        </div>
        <button
          type="button"
          className={styles.viewBagBtn}
          onClick={() => router.push("/cart")}
        >
          VIEW BAG
        </button>
      </header>

      <h3 className={styles.subtitle}>You may also like</h3>

      {loading && <p className={styles.loading}>Loading recommendations...</p>}

      {!loading && (
        <div className={styles.products}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.productCard}
              onClick={() => router.push(`/product/${item.id}`)}
            >
              <div className={styles.productImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image ?? "/images/placeholder-rect.svg"}
                  alt={item.title}
                />
              </div>
              <p className={styles.productTitle}>{item.title}</p>
              <p className={styles.productPrice}>{formatPrice(item.finalPrice)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

