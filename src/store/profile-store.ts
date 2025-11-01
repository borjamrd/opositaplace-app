// src/store/profile-store.ts
import { ProfileWithOnboarding } from '@/lib/supabase/types';
import { create } from 'zustand';

interface ProfileState {
  profile: ProfileWithOnboarding | null;
  isLoading: boolean;
  error: Error | null;
  setProfile: (profile: ProfileWithOnboarding | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  error: null,
  setProfile: (profile) => set({ profile, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false, profile: null }),
  clearProfile: () => set({ profile: null, isLoading: false, error: null }),
}));
