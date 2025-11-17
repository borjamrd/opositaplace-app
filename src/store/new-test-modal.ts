// src/store/new-test-modal-store.ts
import { create } from 'zustand';

interface NewTestModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useNewTestModalStore = create<NewTestModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
