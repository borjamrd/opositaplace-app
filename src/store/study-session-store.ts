// src/store/study-session-store.ts
import { createClient } from '@/lib/supabase/client';
import { Opposition, StudyCycle } from '@/lib/supabase/types';
import { create } from 'zustand';

interface StudySessionState {
  oppositions: Opposition[];
  activeOpposition: Opposition | null;
  studyCycles: StudyCycle[];
  activeStudyCycle: StudyCycle | null;
  isLoadingOppositions: boolean;
  isLoadingCycles: boolean;
  selectOpposition: (oppositionId: string) => Promise<void>;
  selectStudyCycle: (cycleId: string) => void;
  reset: () => void;
}

const initialState: Omit<StudySessionState, 'selectOpposition' | 'selectStudyCycle' | 'reset'> = {
  oppositions: [],
  activeOpposition: null,
  studyCycles: [],
  activeStudyCycle: null,
  isLoadingOppositions: true,
  isLoadingCycles: true,
};

const supabase = createClient();

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  ...initialState,

  selectOpposition: async (oppositionId) => {
    const { oppositions } = get();
    const newActiveOpposition = oppositions.find((op) => op.id === oppositionId) || null;
    set({
      activeOpposition: newActiveOpposition,
      isLoadingCycles: true,
      studyCycles: [],
      activeStudyCycle: null,
    });

    if (!newActiveOpposition) {
      set({ isLoadingCycles: false });
      return;
    }

    const { data: cycles, error } = await supabase
      .from('user_study_cycles')
      .select('*')
      .eq('opposition_id', newActiveOpposition.id)
      .order('cycle_number', { ascending: true });

    if (error) {
      console.error('Error fetching study cycles:', error);
      set({ isLoadingCycles: false });
      return;
    }

    const activeCycle = cycles.find((c) => !c.completed_at) ?? cycles[0] ?? null;
    set({ studyCycles: cycles, activeStudyCycle: activeCycle, isLoadingCycles: false });
  },

  selectStudyCycle: (cycleId) => {
    const { studyCycles } = get();
    const newActiveCycle = studyCycles.find((c) => c.id === cycleId) || null;
    set({ activeStudyCycle: newActiveCycle });
  },

  reset: () => {
    set(initialState);
  },
}));
