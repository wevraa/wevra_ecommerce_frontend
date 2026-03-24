import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BoutiqueOrderState {
  /** Sleeve/neck design selections keyed by productId — persisted to localStorage. */
  sleeveDesigns: Record<string, string>;
  setSleeveDesign: (productId: string, imageUrl: string) => void;
  clearSleeveDesign: (productId: string) => void;
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
      frontNeckDesignImage: null,
      setFrontNeckDesign: (imageUrl) => set({ frontNeckDesignImage: imageUrl }),
      clearFrontNeckDesign: () => set({ frontNeckDesignImage: null }),
    }),
    { name: "boutique-order-store" }
  )
);
