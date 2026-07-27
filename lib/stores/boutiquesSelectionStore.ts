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
  orderTypes?: string[];
  /** Selected blouse size label (e.g. "38"). */
  selectedSize?: string;
  measurements?: OrderMeasurement[];
  addons?: OrderAddon[];
  /** True when at least one add-on toggle is on (from /addons). */
  hasAddonsSelected?: boolean;
  /** True when measurement sliders differ from defaults (from /measurement). */
  hasMeasurementSelected?: boolean;
}

interface BoutiquesSelectionState {
  selectedBoutiques: SelectedBoutique[];
  orderContext: OrderContext;
  toggleBoutique: (boutique: SelectedBoutique) => void;
  setOrderContext: (ctx: OrderContext) => void;
  clearSelection: () => void;
  clearBoutiqueSelection: () => void;
}

export const MAX_BOUTIQUE_SELECTION = 5;

export const useBoutiquesSelectionStore = create<BoutiquesSelectionState>()(
  persist(
    (set) => ({
      selectedBoutiques: [],
      orderContext: {},
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
      clearSelection: () => set({ selectedBoutiques: [], orderContext: {} }),
      clearBoutiqueSelection: () => set({ selectedBoutiques: [] }),
    }),
    { name: "boutiques-selection-store" }
  )
);
