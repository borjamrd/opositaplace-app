import { create } from 'zustand';

export type TimerMode = 'countdown' | 'pomodoro' | 'stopwatch';
export type PomodoroSessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerState {
    isActive: boolean;
    mode: TimerMode;
    startTime: number | null;
    duration: number;
    remainingTime: number;

    pomodoroDuration: number; // Duración del foco en segundos
    shortBreakDuration: number; // Duración del descanso corto en segundos
    longBreakDuration: number; // Duración del descanso largo en segundos
    activePomodoroSession: PomodoroSessionType; // Sesión activa en la UI de Pomodoro

    setMode: (mode: TimerMode) => void;
    startTimer: (duration: number) => void;
    resumeTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    updateRemainingTime: (time: number) => void;
    hydrate: () => void;

    setActivePomodoroSession: (sessionType: PomodoroSessionType) => void;
    setPomodoroDurations: (durations: { pomodoro: number; short: number; long: number }) => void;
}

const TIMER_STORAGE_KEY = 'op-timer-state';

function saveStateToStorage(state: TimerState) {
    const { isActive, mode, startTime, duration, remainingTime } = state;
    window.localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({ isActive, mode, startTime, duration, remainingTime })
    );
}

function loadStateFromStorage(): Partial<TimerState> | null {
    if (typeof window === 'undefined') return null;
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
    mode: 'countdown',
    startTime: null,
    duration: 0,
    remainingTime: 0,

    pomodoroDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    activePomodoroSession: 'pomodoro',

    setMode: (mode) => {
        set({ mode });
        saveStateToStorage({ ...get(), mode });
    },
    startTimer: (duration) => {
        const now = Date.now();
        set({
            isActive: true,
            startTime: now,
            duration: duration,
            remainingTime: duration,
        });
        saveStateToStorage({
            ...get(),
            isActive: true,
            startTime: now,
            duration: duration,
            remainingTime: duration,
        });
    },
    resumeTimer: () => {
        const { duration, remainingTime, mode } = get();
        let elapsed = 0;
        if (mode === 'stopwatch') {
            elapsed = remainingTime;
        } else {
            elapsed = duration - remainingTime;
        }

        const newStartTime = Date.now() - elapsed * 1000;
        set({
            isActive: true,
            startTime: newStartTime,
        });
        saveStateToStorage({ ...get(), isActive: true, startTime: newStartTime });
    },
    stopTimer: () => {
        set({ isActive: false });
        saveStateToStorage({ ...get(), isActive: false });
    },
    resetTimer: () => {
        set({
            isActive: false,
            startTime: null,
            duration: 0,
            remainingTime: 0,
        });
        window.localStorage.removeItem(TIMER_STORAGE_KEY);
    },
    updateRemainingTime: (time) => {
        set({ remainingTime: time });
        saveStateToStorage({ ...get(), remainingTime: time });
    },

    setActivePomodoroSession: (sessionType) => {
        set({ activePomodoroSession: sessionType });
        // No es necesario guardar esto en localStorage, es estado de la UI
    },
    setPomodoroDurations: (durations) => {
        const newDurations = {
            pomodoroDuration: durations.pomodoro * 60,
            shortBreakDuration: durations.short * 60,
            longBreakDuration: durations.long * 60,
        };
        set(newDurations);
        saveStateToStorage({ ...get(), ...newDurations }); // Guarda las nuevas duraciones
    },
    hydrate: () => {
        const loaded = loadStateFromStorage();
        if (loaded) {
            set({ ...loaded });
        }
    },
}));

// Hydrate on load (for client only)
if (typeof window !== 'undefined') {
    useTimerStore.getState().hydrate();
}
