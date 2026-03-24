import { create } from "zustand";

/** Client state for the boutique order flow (sleeve/neck design picked on select-sleeve-design). */
interface BoutiqueOrderState {
  frontNeckDesignImage: string | null;
  setFrontNeckDesign: (imageUrl: string) => void;
  clearFrontNeckDesign: () => void;
}

export const useBoutiqueOrderStore = create<BoutiqueOrderState>((set) => ({
  frontNeckDesignImage: null,
  setFrontNeckDesign: (imageUrl) => set({ frontNeckDesignImage: imageUrl }),
  clearFrontNeckDesign: () => set({ frontNeckDesignImage: null }),
}));
