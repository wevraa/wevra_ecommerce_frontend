import { clearOrderFlowReset } from "@/lib/orderFlowReset";
import type { ChatAttachment, ChatMessage } from "@/lib/chat/types";
import {
  useBoutiquesSelectionStore,
  type QuoteLineItem,
  type SelectedBoutique,
} from "@/lib/stores/boutiquesSelectionStore";
import { useBoutiqueOrderStore } from "@/lib/stores/boutiqueOrderStore";

const LABEL_TO_SLOT: Record<string, string> = {
  Fabric: "1",
  Material: "1",
  "Front Neck Design": "2",
  "Front Design": "2",
  "Back Design": "3",
  "Sleeves Design": "4",
  "Sleeve Design": "4",
};

const SLOT_LABELS: Record<string, string> = {
  "1": "Fabric",
  "2": "Front Neck Design",
  "3": "Back Design",
  "4": "Sleeves Design",
};

function collectImages(msg: ChatMessage): ChatAttachment[] {
  if (msg.attachments.length > 0) return msg.attachments;
  return msg.imageUrls.map((url) => ({ url }));
}

/**
 * Restore select-boutiques / order-quote stores from a chat ORDER_REQUEST
 * so the customer can edit and resend the same flow.
 */
export function hydrateOrderQuoteFromChatMessage(
  msg: ChatMessage,
  boutique?: SelectedBoutique | null
): void {
  clearOrderFlowReset();

  const images = collectImages(msg);
  const key = "global";
  const setSelectedImageForSlot = useBoutiqueOrderStore.getState().setSelectedImageForSlot;
  const setFrontNeckDesign = useBoutiqueOrderStore.getState().setFrontNeckDesign;

  const styleImages: string[] = [];
  const styleLabels: string[] = [];
  let productImage: string | undefined;
  let sleeveDesignImage: string | undefined;
  const usedSlots = new Set<string>();

  const assign = (slotId: string, url: string, label?: string) => {
    if (!url || usedSlots.has(slotId)) return;
    usedSlots.add(slotId);
    setSelectedImageForSlot(key, slotId, url);
    const resolvedLabel = label || SLOT_LABELS[slotId] || label || "Style";
    styleImages.push(url);
    styleLabels.push(resolvedLabel);
    if (slotId === "1") productImage = url;
    if (slotId === "2") {
      sleeveDesignImage = url;
      setFrontNeckDesign(url);
    }
  };

  for (const img of images) {
    const label = (img.label ?? "").trim();
    const slot = LABEL_TO_SLOT[label];
    if (slot) assign(slot, img.url, label || SLOT_LABELS[slot]);
  }

  // Unlabeled leftovers fill remaining slots in order
  let nextSlot = 1;
  for (const img of images) {
    const label = (img.label ?? "").trim();
    if (LABEL_TO_SLOT[label]) continue;
    while (nextSlot <= 4 && usedSlots.has(String(nextSlot))) nextSlot += 1;
    if (nextSlot > 4) break;
    assign(String(nextSlot), img.url, SLOT_LABELS[String(nextSlot)]);
    nextSlot += 1;
  }

  const measurements = (msg.measurements ?? []).map((m) => ({
    name: m.name,
    value: m.value,
    unit: m.unit || "INCHES",
  }));
  const addons = (msg.addons ?? []).map((a) => ({
    optionName: a.optionName,
    subOptionName: a.subOptionName,
    imageUrl: a.imageUrl,
  }));

  const title =
    msg.orderTypes?.[0] || msg.category || "Custom Order";
  const image =
    productImage || styleImages[0] || "/images/placeholder-rect.svg";

  const quoteItem: QuoteLineItem = {
    id: `chat-${msg.id}`,
    title,
    image,
    styleCount: styleImages.length,
    styleImages,
    styleLabels,
    productImage,
    sleeveDesignImage,
    category: msg.category ?? undefined,
    orderTypes: msg.orderTypes?.length ? msg.orderTypes : title ? [title] : undefined,
    measurements,
    addons,
    hasMeasurementSelected: measurements.length > 0,
    hasAddonsSelected: addons.length > 0,
  };

  const store = useBoutiquesSelectionStore.getState();
  store.setOrderContext({
    productImage,
    sleeveDesignImage,
    category: msg.category ?? undefined,
    orderTypes: quoteItem.orderTypes,
    measurements,
    addons,
    hasMeasurementSelected: measurements.length > 0,
    hasAddonsSelected: addons.length > 0,
  });
  store.setQuoteItems([quoteItem]);

  if (boutique?.id) {
    useBoutiquesSelectionStore.setState({
      selectedBoutiques: [
        {
          id: boutique.id,
          name: boutique.name,
          phone: boutique.phone,
          address: boutique.address,
        },
      ],
    });
  }
}
