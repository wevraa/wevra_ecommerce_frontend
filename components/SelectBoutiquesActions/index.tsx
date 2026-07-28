"use client";

import { useRouter } from "next/navigation";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";
import {
  useBoutiquesSelectionStore,
  clearAddingQuoteItem,
  clearEditingQuoteItem,
  getEditingQuoteItemId,
  isAddingQuoteItem,
  type QuoteLineItem,
} from "@/lib/stores/boutiquesSelectionStore";
import { navigateBack } from "@/lib/navigateBack";
import { clearOrderFlowReset } from "@/lib/orderFlowReset";
import styles from "./SelectBoutiquesActions.module.scss";

interface SelectBoutiquesActionsProps {
  productId?: string;
  productImage?: string;
}

const STYLE_LABELS: Record<string, string> = {
  "1": "Fabric",
  "2": "Front Neck Design",
  "3": "Back Design",
  "4": "Sleeves Design",
};

function buildQuoteLineItem(opts: {
  id?: string;
  title: string;
  productId?: string;
  productImage?: string;
  sleeveDesignImage?: string;
  slotMap: Record<string, string>;
  frontFallback?: string | null;
  orderContext: ReturnType<typeof useBoutiquesSelectionStore.getState>["orderContext"];
}): QuoteLineItem {
  const {
    id,
    title,
    productId,
    productImage,
    sleeveDesignImage,
    slotMap,
    frontFallback,
    orderContext,
  } = opts;

  const filledStyles: { id: string; label: string; image: string }[] = [];
  const fabricImg = slotMap["1"] || productImage;
  if (fabricImg) {
    filledStyles.push({ id: "1", label: STYLE_LABELS["1"], image: fabricImg });
  }
  const frontImg = slotMap["2"] || frontFallback || sleeveDesignImage;
  if (frontImg) {
    filledStyles.push({ id: "2", label: STYLE_LABELS["2"], image: frontImg });
  }
  if (slotMap["3"]) {
    filledStyles.push({ id: "3", label: STYLE_LABELS["3"], image: slotMap["3"] });
  }
  if (slotMap["4"]) {
    filledStyles.push({ id: "4", label: STYLE_LABELS["4"], image: slotMap["4"] });
  }

  return {
    id: id ?? `quote-${productId ?? "item"}-${Date.now()}`,
    title,
    image: filledStyles[0]?.image ?? productImage ?? "/images/placeholder-rect.svg",
    styleCount: filledStyles.length,
    styleImages: filledStyles.map((s) => s.image),
    styleLabels: filledStyles.map((s) => s.label),
    productId,
    productImage,
    sleeveDesignImage: sleeveDesignImage ?? frontImg ?? undefined,
    category: orderContext.category,
    tailorCategoryId: orderContext.tailorCategoryId,
    orderTypeId: orderContext.orderTypeId,
    orderTypes: orderContext.orderTypes,
    selectedSize: orderContext.selectedSize,
    selectedPresetId: orderContext.selectedPresetId,
    measurements: orderContext.measurements,
    addons: orderContext.addons,
    hasMeasurementSelected: orderContext.hasMeasurementSelected,
    hasAddonsSelected: orderContext.hasAddonsSelected,
  };
}

export default function SelectBoutiquesActions({
  productId,
  productImage,
}: SelectBoutiquesActionsProps) {
  const router = useRouter();
  const setOrderContext = useBoutiquesSelectionStore((s) => s.setOrderContext);
  const orderContext = useBoutiquesSelectionStore((s) => s.orderContext);
  const setQuoteItems = useBoutiquesSelectionStore((s) => s.setQuoteItems);
  const addQuoteItem = useBoutiquesSelectionStore((s) => s.addQuoteItem);
  const updateQuoteItem = useBoutiquesSelectionStore((s) => s.updateQuoteItem);
  const sleeveDesigns = useBoutiqueOrderStore((s) => s.sleeveDesigns);
  const frontNeckDesignImage = useBoutiqueOrderStore((s) => s.frontNeckDesignImage);
  const selectedImageByProductAndSlot = useBoutiqueOrderStore(
    (s) => s.selectedImageByProductAndSlot
  );

  const resolvedProductId = productId ?? orderContext.productId;
  const resolvedProductImage = productImage ?? orderContext.productImage;

  const handleCancel = () => {
    clearEditingQuoteItem();
    clearAddingQuoteItem();
    navigateBack(router, "/order-quote");
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

    const key = resolvedProductId ?? "global";
    const slotMap = selectedImageByProductAndSlot[key] ?? {};
    const editingId = getEditingQuoteItemId();
    const item = buildQuoteLineItem({
      id: editingId ?? undefined,
      title:
        orderContext.orderTypes?.[0] ||
        orderContext.category ||
        "Custom Order",
      productId: resolvedProductId,
      productImage: resolvedProductImage,
      sleeveDesignImage,
      slotMap,
      frontFallback: sleeveDesignImage ?? frontNeckDesignImage,
      orderContext: {
        ...orderContext,
        productId: resolvedProductId,
        productImage: resolvedProductImage,
        sleeveDesignImage,
        measurements,
        addons,
        hasMeasurementSelected:
          measurements.length > 0 || orderContext.hasMeasurementSelected,
        hasAddonsSelected: addons.length > 0 || orderContext.hasAddonsSelected,
      },
    });

    if (editingId) {
      updateQuoteItem(editingId, item);
      clearEditingQuoteItem();
    } else if (isAddingQuoteItem()) {
      addQuoteItem(item);
      clearAddingQuoteItem();
    } else {
      setQuoteItems([item]);
    }
    clearOrderFlowReset();
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
