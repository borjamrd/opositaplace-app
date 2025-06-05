import { create } from "zustand";

export type TimerMode = "countdown" | "pomodoro" | "stopwatch";

interface TimerState {
  isActive: boolean;
  mode: TimerMode;
  startTime: number | null;
  duration: number; // in seconds
  remainingTime: number; // in seconds
  setMode: (mode: TimerMode) => void;
  startTimer: (duration?: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  updateRemainingTime: (time: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isActive: false,
  mode: "countdown",
  startTime: null,
  duration: 0,
  remainingTime: 0,
  setMode: (mode) => set({ mode }),
  startTimer: (duration) => 
    set((state) => ({ 
      isActive: true, 
      startTime: Date.now(),
      duration: duration || state.duration,
      remainingTime: duration || state.duration
    })),
  stopTimer: () => set({ isActive: false }),
  resetTimer: () => 
    set((state) => ({ 
      isActive: false, 
      startTime: null,
      remainingTime: state.duration 
    })),
  updateRemainingTime: (time) => set({ remainingTime: time })
}));