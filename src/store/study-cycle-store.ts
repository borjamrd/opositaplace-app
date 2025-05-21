import { create } from "zustand";
import type { Database } from "@/lib/database.types"; //

export type StudyCycle =
  Database["public"]["Tables"]["user_study_cycles"]["Row"];

interface StudyCycleState {
  selectedCycleId: string | null;
  setSelectedCycleId: (id: string | null) => void;
  clearSelectedCycle: () => void;
}

export const useStudyCycleStore = create<StudyCycleState>((set) => ({
  selectedCycleId: null,
  setSelectedCycleId: (id) => set({ selectedCycleId: id }),
  clearSelectedCycle: () => set({ selectedCycleId: null }),
}));
