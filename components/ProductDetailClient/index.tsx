"use client";

import { useEffect, useState } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ProductDetailInfo from "@/components/ProductDetailInfo";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductTabs from "@/components/ProductTabs";
import ProductRecommendations from "@/components/ProductRecommendations";
import { getCompleteTheLookAndSimilar } from "@/data/dummy";
import type { CartItem } from "@/data/dummy";
import type { ApiProduct } from "@/lib/api";
import { addToCart } from "@/lib/cartStorage";
import BottomSheet from "@/components/BottomSheet";
import AddedToBagSheet from "@/components/AddedToBagSheet";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddedSheetOpen, setIsAddedSheetOpen] = useState(false);

  useEffect(() => {
    if (!API_BASE) return;
    setLoading(true);
    fetch(`${API_BASE}/v1/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiProduct | null) => {
        setProduct(data);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const { completeTheLook, similarStyles } = getCompleteTheLookAndSimilar(id);

  if (!API_BASE) {
    return null;
  }

  if (loading) {
    return null;
  }

  if (!product) {
    return null;
  }

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
      <ProductImageCarousel images={images} alt={product.title} productId={product.id} />
      <ProductDetailInfo brand={product.title} price={priceNumber} />
      <ProductDetailActions onAddToBag={handleAddToBag} />
      <ProductTabs
        details={product.productDetails ?? ""}
        fitFabric={product.fitAndFabric ?? ""}
        shippingReturn={product.shippingAndReturns ?? ""}
      />
      <ProductRecommendations
        title="Complete The Look"
        products={completeTheLook}
        showShortDescription
      />
      <ProductRecommendations
        title="Similar Styles"
        products={similarStyles}
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

