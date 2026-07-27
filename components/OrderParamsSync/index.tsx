"use client";

import { useEffect } from "react";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";

interface OrderParamsSyncProps {
  productId?: string;
  productImage?: string;
}

/**
 * Persists select-boutiques URL params into local Zustand stores
 * so the custom-order flow keeps product context across navigations.
 */
export default function OrderParamsSync({
  productId,
  productImage,
}: OrderParamsSyncProps) {
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const setSelectedImageForSlot = useBoutiqueOrderStore((s) => s.setSelectedImageForSlot);

  useEffect(() => {
    if (!productId && !productImage) return;

    setOrderContext({
      ...(productId ? { productId } : {}),
      ...(productImage ? { productImage } : {}),
    });

    if (productImage) {
      const key = productId ?? "global";
      setSelectedImageForSlot(key, "1", productImage);
    }
  }, [productId, productImage, setOrderContext, setSelectedImageForSlot]);

  return null;
}
