import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedBoutique {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface OrderMeasurement {
  name: string;
  value: number;
  unit?: string;
}

export interface OrderAddon {
  optionName: string;
  subOptionName: string;
  imageUrl?: string;
}

export interface OrderContext {
  productId?: string;
  productImage?: string;
  sleeveDesignImage?: string;
  category?: string;
  /** Parent tailor category id from /v1/tailor-categories. */
  tailorCategoryId?: string;
  /** Child order-type id from /v1/tailor-categories/tree. */
  orderTypeId?: string;
  orderTypes?: string[];
  /** Selected size preset label (e.g. "34"). */
  selectedSize?: string;
  /** Selected measurement preset id. */
  selectedPresetId?: string;
  measurements?: OrderMeasurement[];
  addons?: OrderAddon[];
  /** True when at least one add-on toggle is on (from /addons). */
  hasAddonsSelected?: boolean;
  /** True when measurement sliders differ from defaults (from /measurement). */
  hasMeasurementSelected?: boolean;
}

/** One custom-order line in Items for Quote (styles 1–4 = one item). */
export interface QuoteLineItem {
  id: string;
  title: string;
  image: string;
  styleCount: number;
  styleImages: string[];
  styleLabels: string[];
  productId?: string;
  productImage?: string;
  sleeveDesignImage?: string;
  category?: string;
  tailorCategoryId?: string;
  orderTypeId?: string;
  orderTypes?: string[];
  selectedSize?: string;
  selectedPresetId?: string;
  measurements?: OrderMeasurement[];
  addons?: OrderAddon[];
  hasMeasurementSelected?: boolean;
  hasAddonsSelected?: boolean;
}

interface BoutiquesSelectionState {
  selectedBoutiques: SelectedBoutique[];
  orderContext: OrderContext;
  /** Items for Quote — one entry per “Next” / “Add more items” flow. */
  quoteItems: QuoteLineItem[];
  /** True after at least one item was committed via Next (empty list after delete is intentional). */
  quoteItemsReady: boolean;
  toggleBoutique: (boutique: SelectedBoutique) => void;
  setOrderContext: (ctx: OrderContext) => void;
  setQuoteItems: (items: QuoteLineItem[]) => void;
  addQuoteItem: (item: QuoteLineItem) => void;
  updateQuoteItem: (id: string, item: QuoteLineItem) => void;
  removeQuoteItem: (id: string) => void;
  clearSelection: () => void;
  clearBoutiqueSelection: () => void;
}

export const MAX_BOUTIQUE_SELECTION = 5;

const ADDING_QUOTE_ITEM_KEY = "wevraa-adding-quote-item";
const EDITING_QUOTE_ITEM_KEY = "wevraa-editing-quote-item";

export function markAddingQuoteItem(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADDING_QUOTE_ITEM_KEY, "1");
    sessionStorage.removeItem(EDITING_QUOTE_ITEM_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAddingQuoteItem(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ADDING_QUOTE_ITEM_KEY);
  } catch {
    /* ignore */
  }
}

export function isAddingQuoteItem(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ADDING_QUOTE_ITEM_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEditingQuoteItem(id: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(EDITING_QUOTE_ITEM_KEY, id);
    sessionStorage.removeItem(ADDING_QUOTE_ITEM_KEY);
  } catch {
    /* ignore */
  }
}

export function clearEditingQuoteItem(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(EDITING_QUOTE_ITEM_KEY);
  } catch {
    /* ignore */
  }
}

export function getEditingQuoteItemId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(EDITING_QUOTE_ITEM_KEY);
  } catch {
    return null;
  }
}

export const useBoutiquesSelectionStore = create<BoutiquesSelectionState>()(
  persist(
    (set) => ({
      selectedBoutiques: [],
      orderContext: {},
      quoteItems: [],
      quoteItemsReady: false,
      toggleBoutique: (boutique) =>
        set((state) => {
          const exists = state.selectedBoutiques.some((b) => b.id === boutique.id);
          if (exists) {
            return {
              selectedBoutiques: state.selectedBoutiques.filter((b) => b.id !== boutique.id),
            };
          }
          if (state.selectedBoutiques.length >= MAX_BOUTIQUE_SELECTION) return state;
          return { selectedBoutiques: [...state.selectedBoutiques, boutique] };
        }),
      setOrderContext: (ctx) =>
        set((state) => ({ orderContext: { ...state.orderContext, ...ctx } })),
      setQuoteItems: (items) => set({ quoteItems: items, quoteItemsReady: true }),
      addQuoteItem: (item) =>
        set((state) => ({
          quoteItems: [...state.quoteItems, item],
          quoteItemsReady: true,
        })),
      updateQuoteItem: (id, item) =>
        set((state) => ({
          quoteItems: state.quoteItems.map((q) => (q.id === id ? { ...item, id } : q)),
          quoteItemsReady: true,
        })),
      removeQuoteItem: (id) =>
        set((state) => ({
          quoteItems: state.quoteItems.filter((q) => q.id !== id),
          quoteItemsReady: true,
        })),
      clearSelection: () =>
        set({
          selectedBoutiques: [],
          orderContext: {},
          quoteItems: [],
          quoteItemsReady: false,
        }),
      clearBoutiqueSelection: () => set({ selectedBoutiques: [] }),
    }),
    { name: "boutiques-selection-store" }
  )
);

/** Wipe boutiques + order context in memory and persisted storage. */
export function resetBoutiquesSelection() {
  clearAddingQuoteItem();
  clearEditingQuoteItem();
  useBoutiquesSelectionStore.setState({
    selectedBoutiques: [],
    orderContext: {},
    quoteItems: [],
    quoteItemsReady: false,
  });
  try {
    useBoutiquesSelectionStore.persist?.clearStorage?.();
  } catch {
    /* ignore */
  }
  useBoutiquesSelectionStore.setState({
    selectedBoutiques: [],
    orderContext: {},
    quoteItems: [],
    quoteItemsReady: false,
  });
}
