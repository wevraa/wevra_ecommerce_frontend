"use client";

import { useEffect, useState } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ProductDetailInfo from "@/components/ProductDetailInfo";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductTabs from "@/components/ProductTabs";
import ProductRecommendations from "@/components/ProductRecommendations";
import type { CartItem, Product } from "@/data/dummy";
import type { ApiProduct } from "@/lib/api";
import { addToCart } from "@/lib/cartStorage";
import BottomSheet from "@/components/BottomSheet";
import AddedToBagSheet from "@/components/AddedToBagSheet";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface ProductDetailClientProps {
  id: string;
}

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    brand: p.title,
    price: Number(p.finalPrice ?? p.mrp ?? 0) || 0,
    image:
      p.media?.length
        ? p.media[0].url
        : "/images/placeholder-rect.svg",
    alt: p.title,
    shortDescription: p.productDescription ?? undefined,
  };
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddedSheetOpen, setIsAddedSheetOpen] = useState(false);

  useEffect(() => {
    if (!API_BASE) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/v1/products/${id}`)
        .then((res) => (res.ok ? (res.json() as Promise<ApiProduct>) : null))
        .catch(() => null),
      fetch(`${API_BASE}/v1/products`)
        .then((res) => (res.ok ? (res.json() as Promise<ApiProduct[]>) : []))
        .catch(() => [] as ApiProduct[]),
    ])
      .then(([productData, allProducts]) => {
        setProduct(productData);

        const list = Array.isArray(allProducts) ? allProducts : [];
        const others = list.filter((p) => p.id !== id);

        const categoryId = productData?.categoryId;
        const sameCat = categoryId
          ? others.filter((p) => p.categoryId === categoryId)
          : [];

        const similar = (sameCat.length > 0 ? sameCat : others)
          .slice(0, 8)
          .map(toProduct);

        setSimilarProducts(similar);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!API_BASE) return null;
  if (loading) return null;
  if (!product) return null;

  const images = product.media?.length ? product.media.map((m) => m.url) : [];
  const priceNumber = Number(product.finalPrice ?? product.mrp ?? 0) || 0;

  const handleAddToBag = async () => {
    const image = images[0] ?? "/images/placeholder-rect.svg";
    const cartItem: CartItem = {
      id: "",
      productId: product.id,
      brand: product.title,
      description: product.productDescription ?? "",
      price: priceNumber,
      size: "S",
      image,
      quantity: 1,
    };
    await addToCart(cartItem);
    setIsAddedSheetOpen(true);
  };

  return (
    <>
      <ProductImageCarousel
        images={images}
        alt={product.title}
        productId={product.id}
      />
      <ProductDetailInfo brand={product.title} price={priceNumber} />
      <ProductDetailActions onAddToBag={handleAddToBag} />
      <ProductTabs
        details={product.productDetails ?? ""}
        fitFabric={product.fitAndFabric ?? ""}
        shippingReturn={product.shippingAndReturns ?? ""}
      />
      <ProductRecommendations
        title="Similar Styles"
        products={similarProducts}
        showShortDescription
      />
      <BottomSheet
        open={isAddedSheetOpen}
        onClose={() => setIsAddedSheetOpen(false)}
      >
        <AddedToBagSheet />
      </BottomSheet>
    </>
  );
}
