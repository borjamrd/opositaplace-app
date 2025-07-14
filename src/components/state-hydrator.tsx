// src/components/state-hydrator.tsx
'use client';

import { useProfileStore } from '@/store/profile-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useStudySessionStore } from '@/store/study-session-store';
import { useEffect, useRef } from 'react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];
type Opposition = Database['public']['Tables']['oppositions']['Row'];
type StudyCycle = Database['public']['Tables']['user_study_cycles']['Row'];

interface StateHydratorProps {
    profile: Profile | null;
    subscription: Subscription | null;
    userOppositions: Opposition[];
    activeOpposition: Opposition | null;
    studyCycles: StudyCycle[];
    activeStudyCycle: StudyCycle | null;
}

export function StateHydrator({
    profile,
    subscription,
    userOppositions,
    activeOpposition,
    studyCycles,
    activeStudyCycle,
}: StateHydratorProps) {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current) {
            useProfileStore.setState({ profile, isLoading: false, error: null });
            useSubscriptionStore.setState({ subscription, isLoading: false, error: null });
            useStudySessionStore.setState({
                oppositions: userOppositions,
                activeOpposition: activeOpposition,
                studyCycles: studyCycles,
                activeStudyCycle: activeStudyCycle,
                isLoadingOppositions: false,
                isLoadingCycles: false,
            });
            isInitialized.current = true;
        }
    }, [profile, subscription, userOppositions, activeOpposition, studyCycles, activeStudyCycle]);

    return null;
}
