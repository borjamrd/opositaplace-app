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
  hydrate: () => void;
}

const TIMER_STORAGE_KEY = "op-timer-state";

function saveStateToStorage(state: TimerState) {
  const { isActive, mode, startTime, duration, remainingTime } = state;
  window.localStorage.setItem(
    TIMER_STORAGE_KEY,
    JSON.stringify({ isActive, mode, startTime, duration, remainingTime })
  );
}

function loadStateFromStorage(): Partial<TimerState> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isActive: false,
  mode: "countdown",
  startTime: null,
  duration: 0,
  remainingTime: 0,
  setMode: (mode) => {
    set({ mode });
    saveStateToStorage({ ...get(), mode });
  },
  startTimer: (duration) => {
    const now = Date.now();
    const d = duration ?? get().duration;
    set({
      isActive: true,
      startTime: now,
      duration: d,
      remainingTime: d,
    });
    saveStateToStorage({ ...get(), isActive: true, startTime: now, duration: d, remainingTime: d });
  },
  stopTimer: () => {
    set({ isActive: false });
    saveStateToStorage({ ...get(), isActive: false });
  },
  resetTimer: () => {
    set((state) => ({
      isActive: false,
      startTime: null,
      remainingTime: state.duration,
    }));
    saveStateToStorage({ ...get(), isActive: false, startTime: null, remainingTime: get().duration });
  },
  updateRemainingTime: (time) => {
    set({ remainingTime: time });
    saveStateToStorage({ ...get(), remainingTime: time });
  },
  hydrate: () => {
    const loaded = loadStateFromStorage();
    if (loaded) {
      set({ ...loaded });
    }
  },
}));

// Hydrate on load (for client only)
if (typeof window !== "undefined") {
  useTimerStore.getState().hydrate();
}