"use client";

import { useRouter } from "next/navigation";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import { useBoutiquesSelectionStore } from "@/lib/stores/boutiquesSelectionStore";
import { navigateBack } from "@/lib/navigateBack";
import styles from "./SelectBoutiquesActions.module.scss";

interface SelectBoutiquesActionsProps {
  productId?: string;
  productImage?: string;
}

export default function SelectBoutiquesActions({
  productId,
  productImage,
}: SelectBoutiquesActionsProps) {
  const router = useRouter();
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const sleeveDesigns = useBoutiqueOrderStore((s) => s.sleeveDesigns);

  const resolvedProductId = productId ?? orderContext.productId;
  const resolvedProductImage = productImage ?? orderContext.productImage;

  const handleCancel = () => {
    navigateBack(router, "/");
  };

  const handleNext = () => {
    const sleeveDesignImage = resolvedProductId
      ? sleeveDesigns[resolvedProductId]
      : undefined;
    const measurements = orderContext.measurements ?? [];
    const addons = orderContext.addons ?? [];
    setOrderContext({
      productId: resolvedProductId,
      productImage: resolvedProductImage,
      sleeveDesignImage,
      // Keep measurement + addon selections for order-quote / Send API
      ...(measurements.length > 0
        ? { measurements, hasMeasurementSelected: true }
        : {}),
      ...(orderContext.selectedSize
        ? { selectedSize: orderContext.selectedSize }
        : {}),
      ...(orderContext.selectedPresetId
        ? { selectedPresetId: orderContext.selectedPresetId }
        : {}),
      ...(addons.length > 0 ? { addons, hasAddonsSelected: true } : {}),
    });
    router.push("/order-quote");
  };

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
        Cancel
      </button>
      <button type="button" className={styles.nextBtn} onClick={handleNext}>
        Next
      </button>
    </div>
  );
}
