import { create } from "zustand";

export interface OppositionBase {
  id: string;
  name: string;
  description?: string | null;
}

interface ActiveOppositionState {
  activeOpposition: OppositionBase | null;
  setActiveOpposition: (opposition: OppositionBase | null) => void;
}

export const useOppositionStore = create<ActiveOppositionState>((set) => ({
  activeOpposition: null,
  setActiveOpposition: (opposition) => set({ activeOpposition: opposition }),
}));
