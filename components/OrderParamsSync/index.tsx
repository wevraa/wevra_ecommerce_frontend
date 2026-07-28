"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { consumeOrderFlowReset } from "@/lib/orderFlowReset";
import { resetBoutiqueOrderImages } from "@/lib/stores/boutiqueOrderStore";
import { resetBoutiquesSelection } from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";

interface OrderParamsSyncProps {
  productId?: string;
  productImage?: string;
}

/**
 * Persists select-boutiques URL params into local Zustand stores
 * so the custom-order flow keeps product context across navigations.
 * After a successful Send, strips stale ?productId=&image= params.
 */
export default function OrderParamsSync({
  productId,
  productImage,
}: OrderParamsSyncProps) {
  const router = useRouter();
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const setSelectedImageForSlot = useBoutiqueOrderStore((s) => s.setSelectedImageForSlot);

  useEffect(() => {
    if (consumeOrderFlowReset()) {
      resetBoutiquesSelection();
      resetBoutiqueOrderImages();
      if (productId || productImage) {
        router.replace("/select-boutiques");
      }
      return;
    }

    if (!productId && !productImage) return;

    setOrderContext({
      ...(productId ? { productId } : {}),
      ...(productImage ? { productImage } : {}),
    });

    if (productImage) {
      const key = productId ?? "global";
      setSelectedImageForSlot(key, "1", productImage);
    }
  }, [productId, productImage, router, setOrderContext, setSelectedImageForSlot]);

  return null;
}
