import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

export type OppositionBase = {
    id: string;
    name: string;
};

const initialState = {
    oppositions: [],
    activeOpposition: null,
    studyCycles: [],
    activeStudyCycle: null,
    isLoadingOppositions: false,
    isLoadingCycles: false,
};

export type StudyCycle = Database['public']['Tables']['user_study_cycles']['Row'];

interface StudySessionState {
    oppositions: OppositionBase[];
    activeOpposition: OppositionBase | null;
    studyCycles: StudyCycle[];
    activeStudyCycle: StudyCycle | null;

    isLoadingOppositions: boolean;
    isLoadingCycles: boolean;

    fetchInitialSession: (userId: string) => Promise<void>;
    selectOpposition: (oppositionId: string) => Promise<void>;
    selectStudyCycle: (cycleId: string) => void;
    reset: () => void;
}

const supabase = createClient();

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
    oppositions: [],
    activeOpposition: null,
    studyCycles: [],
    activeStudyCycle: null,
    isLoadingOppositions: true,
    isLoadingCycles: false,
    fetchInitialSession: async (userId) => {
        set({ isLoadingOppositions: true, oppositions: [], activeOpposition: null });

        const { data: userOppositions, error } = await supabase
            .from('user_oppositions')
            .select('active, oppositions (id, name)')
            .eq('profile_id', userId);

        if (error || !userOppositions) {
            set({ isLoadingOppositions: false });
            return;
        }

        const availableOppositions = userOppositions
            .map((uo) => uo.oppositions)
            .filter((op): op is OppositionBase => op !== null);

        set({ oppositions: availableOppositions, isLoadingOppositions: false });

        // Seleccionar la oposición activa o la primera por defecto
        const activeUserOpposition = userOppositions.find((uo) => uo.active);
        const defaultOppositionId =
            activeUserOpposition?.oppositions?.id ?? availableOppositions[0]?.id;

        if (defaultOppositionId) {
            await get().selectOpposition(defaultOppositionId);
        }
    },

    // Acción para cambiar de oposición
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

        if (error || !cycles) {
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
