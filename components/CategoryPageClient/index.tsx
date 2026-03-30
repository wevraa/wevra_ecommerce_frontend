"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { SkeletonBox, SkeletonProductCard } from "@/components/Skeleton";
import type { Product } from "@/data/dummy";
import type { ApiProduct } from "@/lib/api";
import { normalizeCategoryProductsPayload } from "@/lib/api";
import styles from "@/components/CollectionPageClient/CollectionPageClient.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    brand: p.title,
    price: Number(p.finalPrice ?? p.mrp ?? 0) || 0,
    image: p.media?.length ? p.media[0].url : "/images/placeholder-rect.svg",
    alt: p.title,
    shortDescription: p.productDescription ?? undefined,
  };
}

interface CategoryPageClientProps {
  id: string;
}

async function fetchProductsForCategory(categoryId: string): Promise<{
  name: string | null;
  products: ApiProduct[];
}> {
  let categoryName: string | null = null;
  let products: ApiProduct[] = [];

  const catRes = await fetch(`${API_BASE}/v1/categories/${categoryId}`);
  if (catRes.ok) {
    const cat = (await catRes.json()) as { name?: string; products?: unknown };
    categoryName = typeof cat.name === "string" ? cat.name : null;
    products = normalizeCategoryProductsPayload(cat.products);
  }

  const needsMore = products.length === 0;

  if (needsMore) {
    const qRes = await fetch(
      `${API_BASE}/v1/products?categoryId=${encodeURIComponent(categoryId)}`
    );
    if (qRes.ok) {
      const data = await qRes.json();
      const list = Array.isArray(data) ? data : (data as { data?: ApiProduct[] })?.data;
      if (Array.isArray(list)) products = list.filter((p) => p?.id);
    }
  }

  if (products.length === 0) {
    const allRes = await fetch(`${API_BASE}/v1/products`);
    if (allRes.ok) {
      const all = (await allRes.json()) as ApiProduct[];
      if (Array.isArray(all)) {
        products = all.filter((p) => p.categoryId === categoryId);
      }
    }
  }

  if (!categoryName && products.length > 0) {
    categoryName = products[0].category?.name ?? null;
  }

  return { name: categoryName, products };
}

export default function CategoryPageClient({ id }: CategoryPageClientProps) {
  const [title, setTitle] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { name, products: apiProducts } = await fetchProductsForCategory(id);
        if (cancelled) return;
        setTitle(name);
        setProducts(apiProducts.map(apiProductToProduct));
        if (apiProducts.length === 0) setNotFound(true);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!API_BASE) return null;

  if (loading) {
    return (
      <section className={styles.section} aria-busy aria-label="Loading category">
        <SkeletonBox width={200} height={22} borderRadius={6} />
        <div className={styles.grid} style={{ marginTop: 24 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (notFound && products.length === 0) {
    return (
      <section className={styles.section}>
        <h1 className={styles.title}>{title ?? "Category"}</h1>
        <p className={styles.empty}>No products in this category yet, or this category was not found.</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="category-title">
      <h1 id="category-title" className={styles.title}>
        {title ?? "Products"}
      </h1>
      {products.length === 0 ? (
        <p className={styles.empty}>No products in this category yet.</p>
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
