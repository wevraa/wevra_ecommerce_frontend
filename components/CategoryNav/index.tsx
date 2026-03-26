"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ApiCategory } from "@/lib/api";
import styles from "./CategoryNav.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function CategoryNav() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/v1/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const activeCategories = categories.filter((c) => c.status === "ACTIVE");

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll} role="list">
        {/* Static "All Products" item always shown first */}
        <Link href="/" className={styles.item} role="listitem">
          <span className={styles.circle}>
            <Image
              src="/images/product-1.svg"
              alt=""
              fill
              className={styles.circleImage}
              sizes="64px"
            />
          </span>
          <span className={styles.label}>All Products</span>
        </Link>

        {activeCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={styles.item}
            role="listitem"
          >
            <span className={styles.circle}>
              {cat.thumbnailImage ? (
                <Image
                  src={cat.thumbnailImage}
                  alt=""
                  fill
                  className={styles.circleImage}
                  sizes="64px"
                />
              ) : null}
            </span>
            <span className={styles.label}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
