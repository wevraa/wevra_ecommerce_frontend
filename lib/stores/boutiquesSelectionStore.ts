import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedBoutique {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface OrderContext {
  productId?: string;
  productImage?: string;
  sleeveDesignImage?: string;
}

interface BoutiquesSelectionState {
  selectedBoutiques: SelectedBoutique[];
  orderContext: OrderContext;
  toggleBoutique: (boutique: SelectedBoutique) => void;
  setOrderContext: (ctx: OrderContext) => void;
  clearSelection: () => void;
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
      setOrderContext: (ctx) => set({ orderContext: ctx }),
      clearSelection: () => set({ selectedBoutiques: [], orderContext: {} }),
    }),
    { name: "boutiques-selection-store" }
  )
);
