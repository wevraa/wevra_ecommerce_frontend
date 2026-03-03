"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/dummy";
import type { ApiCollectionDetail } from "@/lib/api";
import styles from "./CollectionPageClient.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface CollectionProductSummary {
  id: string;
  title: string;
  mrp: string | null;
  finalPrice: string | null;
  productDescription: string | null;
}

interface CollectionPageClientProps {
  id: string;
}

export default function CollectionPageClient({ id }: CollectionPageClientProps) {
  const [collection, setCollection] = useState<ApiCollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_BASE) return;
    setLoading(true);
    fetch(`${API_BASE}/v1/collections/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiCollectionDetail | null) => {
        setCollection(data);
      })
      .catch(() => setCollection(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!API_BASE) return null;
  if (loading) return <div className={styles.section}>Loading...</div>;
  if (!collection) return <div className={styles.section}>Collection not found.</div>;

  const entryList = Array.isArray(collection.products) ? collection.products : [];

  const products: Product[] = entryList
    .map((entry: any) => {
      const p: CollectionProductSummary | undefined = entry?.product;
      if (!p) return null;
      const price = Number(p.finalPrice ?? p.mrp ?? 0) || 0;
      const image =
        (typeof collection.image === "string" && collection.image) ||
        "/images/placeholder-rect.svg";
      return {
        id: p.id,
        brand: p.title,
        price,
        image,
        alt: p.title,
        shortDescription: p.productDescription ?? undefined,
      } satisfies Product;
    })
    .filter(Boolean) as Product[];

  return (
    <section className={styles.section} aria-labelledby="collection-title">
      <h1 id="collection-title" className={styles.title}>
        {collection.title}
      </h1>
      {products.length === 0 ? (
        <p className={styles.empty}>No products in this collection yet.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showShortDescription />
          ))}
        </div>
      )}
    </section>
  );
}
