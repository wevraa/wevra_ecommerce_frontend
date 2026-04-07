import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BoutiqueOrderState {
  /** Sleeve/neck design selections keyed by productId — persisted to localStorage. */
  sleeveDesigns: Record<string, string>;
  setSleeveDesign: (productId: string, imageUrl: string) => void;
  clearSleeveDesign: (productId: string) => void;
  /** Selected image overrides per tile (Selected Images grid). */
  selectedImageByProductAndSlot: Record<string, Record<string, string>>;
  setSelectedImageForSlot: (productIdOrGlobal: string, slotId: string, imageUrl: string) => void;
  clearSelectedImageForSlot: (productIdOrGlobal: string, slotId: string) => void;
  /** Legacy single-session field kept for backward compatibility. */
  frontNeckDesignImage: string | null;
  setFrontNeckDesign: (imageUrl: string) => void;
  clearFrontNeckDesign: () => void;
}

export const useBoutiqueOrderStore = create<BoutiqueOrderState>()(
  persist(
    (set) => ({
      sleeveDesigns: {},
      setSleeveDesign: (productId, imageUrl) =>
        set((state) => ({
          sleeveDesigns: { ...state.sleeveDesigns, [productId]: imageUrl },
        })),
      clearSleeveDesign: (productId) =>
        set((state) => {
          const { [productId]: _removed, ...rest } = state.sleeveDesigns;
          return { sleeveDesigns: rest };
        }),
      selectedImageByProductAndSlot: {},
      setSelectedImageForSlot: (productIdOrGlobal, slotId, imageUrl) =>
        set((state) => {
          const prevBySlot = state.selectedImageByProductAndSlot[productIdOrGlobal] ?? {};
          return {
            selectedImageByProductAndSlot: {
              ...state.selectedImageByProductAndSlot,
              [productIdOrGlobal]: { ...prevBySlot, [slotId]: imageUrl },
            },
          };
        }),
      clearSelectedImageForSlot: (productIdOrGlobal, slotId) =>
        set((state) => {
          const prevBySlot = state.selectedImageByProductAndSlot[productIdOrGlobal];
          if (!prevBySlot) return state;
          const { [slotId]: _removed, ...restSlots } = prevBySlot;
          return {
            selectedImageByProductAndSlot: {
              ...state.selectedImageByProductAndSlot,
              [productIdOrGlobal]: restSlots,
            },
          };
        }),
      frontNeckDesignImage: null,
      setFrontNeckDesign: (imageUrl) => set({ frontNeckDesignImage: imageUrl }),
      clearFrontNeckDesign: () => set({ frontNeckDesignImage: null }),
    }),
    { name: "boutique-order-store" }
  )
);
