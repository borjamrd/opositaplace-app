import { queryClient } from '@/lib/react-query/queryClient';
import { createClient } from '@/lib/supabase/client';
import { create } from 'zustand';
import { useStudySessionStore } from './study-session-store';

export type TimerMode = 'countdown' | 'pomodoro' | 'stopwatch' | 'manual';
export type PomodoroSessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerState {
  isModalOpen: boolean;
  isActive: boolean;
  mode: TimerMode;
  startTime: number | null;
  duration: number;
  remainingTime: number;
  sessionStartedAt: number | null;

  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  activePomodoroSession: PomodoroSessionType;

  setModalOpen: (modal: boolean) => void;
  setMode: (mode: TimerMode) => void;
  startTimer: (duration: number) => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateRemainingTime: (time: number) => void;
  hydrate: () => void;
  setPomodoroDurations: (durations: { pomodoro: number; short: number; long: number }) => void;
  setActivePomodoroSession: (sessionType: PomodoroSessionType) => void;
  skipToNextPomodoroStage: () => void;

  reset: () => void;
  saveSessionAndReset: () => Promise<{ durationSeconds: number } | null>;
  saveManualSession: (durationSeconds: number, date: Date) => Promise<void>;
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

const supabase = createClient();

export const useTimerStore = create<TimerState>((set, get) => ({
  isModalOpen: false,
  sessionStartedAt: null,
  isActive: false,
  mode: 'stopwatch',
  startTime: null,
  duration: 0,
  remainingTime: 0,

  pomodoroDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  activePomodoroSession: 'pomodoro',

  setModalOpen: (modal) => {
    set({
      isModalOpen: modal,
    });
  },
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
      sessionStartedAt: get().sessionStartedAt ?? now,
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

  updateRemainingTime: (time) => {
    set({ remainingTime: time });
    saveStateToStorage({ ...get(), remainingTime: time });
  },

  setActivePomodoroSession: (sessionType) => {
    set({ activePomodoroSession: sessionType });
  },
  skipToNextPomodoroStage: () => {
    const { activePomodoroSession, pomodoroDuration, shortBreakDuration } = get();
    // Logic: If in Pomodoro -> Short Break. If in Break (Short or Long) -> Pomodoro.
    const nextSession = activePomodoroSession === 'pomodoro' ? 'shortBreak' : 'pomodoro';
    const nextDuration = nextSession === 'pomodoro' ? pomodoroDuration : shortBreakDuration;

    set({
      activePomodoroSession: nextSession,
      isActive: false,
      startTime: null,
      duration: nextDuration,
      remainingTime: nextDuration,
      sessionStartedAt: null, // Reset session start tracking
    });
    saveStateToStorage({
      ...get(),
      activePomodoroSession: nextSession,
      isActive: false,
      startTime: null,
      duration: nextDuration,
      remainingTime: nextDuration,
    });
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
  saveSessionAndReset: async () => {
    const { mode, remainingTime, duration, sessionStartedAt } = get();

    // Si no había una sesión activa, no hacemos nada
    if (!sessionStartedAt) {
      get().reset(); // Llama al reset simple si no hay nada que guardar
      return null;
    }

    // --- Recopilar datos para la BBDD ---
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { activeOpposition, activeStudyCycle } = useStudySessionStore.getState();

    let actualDurationSeconds = 0;
    if (mode === 'stopwatch') {
      actualDurationSeconds = remainingTime;
    } else {
      // countdown o pomodoro
      actualDurationSeconds = duration - remainingTime;
    }

    // No guardar sesiones demasiado cortas (p. ej., menos de 5 segundos)
    if (actualDurationSeconds < 5) {
      get().reset(); // Simplemente resetea sin guardar
      return null;
    }

    const sessionData = {
      user_id: user?.id,
      opposition_id: activeOpposition?.id,
      study_cycle_id: activeStudyCycle?.id,
      started_at: new Date(sessionStartedAt).toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: Math.round(actualDurationSeconds),
    };

    // --- Insertar en Supabase ---
    const { error } = await supabase.from('user_study_sessions').insert(sessionData);

    if (error) {
      console.error('Error saving study session:', error);
      // Podrías añadir una notificación al usuario aquí
    } else {
      queryClient.invalidateQueries({ queryKey: ['study-sessions-summary'] });
    }

    // Finalmente, reseteamos el estado del temporizador
    get().reset();

    return { durationSeconds: Math.round(actualDurationSeconds) };
  },
  saveManualSession: async (durationSeconds: number, date: Date) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { activeOpposition, activeStudyCycle } = useStudySessionStore.getState();

    const sessionData = {
      user_id: user?.id,
      opposition_id: activeOpposition?.id,
      study_cycle_id: activeStudyCycle?.id,
      started_at: date.toISOString(),
      ended_at: date.toISOString(),
      duration_seconds: Math.round(durationSeconds),
    };

    const { error } = await supabase.from('user_study_sessions').insert(sessionData);

    if (error) {
      console.error('Error saving manual study session:', error);
      throw error;
    } else {
      queryClient.invalidateQueries({ queryKey: ['study-sessions-summary'] });
    }
  },
  reset: () => {
    set({
      isActive: false,
      startTime: null,
      duration: 0,
      remainingTime: 0,
      sessionStartedAt: null,
      activePomodoroSession: 'pomodoro',
    });
    window.localStorage.removeItem(TIMER_STORAGE_KEY);
  },
}));

if (typeof window !== 'undefined') {
  useTimerStore.getState().hydrate();
}
