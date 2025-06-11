import { Subscription } from '@/lib/stripe/actions';
import { create } from 'zustand';

interface SubscriptionStore {
    activeSubscription: Subscription | null;
    isLoading: boolean;
    error: Error | null;
    setSubscription: (subscription: Subscription | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: Error | null) => void;
    clearActiveSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
    activeSubscription: null,
    isLoading: true,
    error: null,
    setSubscription: (subscription) =>
        set({ activeSubscription: subscription, isLoading: false, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isLoading: false }),
    clearActiveSubscription: () => set({ activeSubscription: null, isLoading: false, error: null }),
}));
