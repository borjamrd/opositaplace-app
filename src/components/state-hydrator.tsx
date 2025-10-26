// src/components/state-hydrator.tsx
'use client';

import { Opposition, Profile, StudyCycle, Subscription } from '@/lib/supabase/types';
import { useProfileStore } from '@/store/profile-store';
import { useStudySessionStore } from '@/store/study-session-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useEffect } from 'react';

interface StateHydratorProps {
  profile?: Profile | null;
  subscription?: Subscription | null;
  userOppositions?: Opposition[];
  activeOpposition?: Opposition | null;
  studyCycles?: StudyCycle[];
  activeStudyCycle?: StudyCycle | null;
}

export function StateHydrator({
  profile,
  subscription,
  userOppositions,
  activeOpposition,
  studyCycles,
  activeStudyCycle,
}: StateHydratorProps) {
  useEffect(() => {
    if (typeof profile !== 'undefined') {
      useProfileStore.setState({ profile, isLoading: false, error: null });
    }
  }, [profile]);

  useEffect(() => {
    if (typeof subscription !== 'undefined') {
      useSubscriptionStore.setState({ subscription, isLoading: false, error: null });
    }
  }, [subscription]);

  useEffect(() => {
    if (typeof userOppositions !== 'undefined') {
      useStudySessionStore.setState({
        oppositions: userOppositions,
        activeOpposition: activeOpposition,
        studyCycles: studyCycles,
        activeStudyCycle: activeStudyCycle,
        isLoadingOppositions: false,
        isLoadingCycles: false,
      });
    }
  }, [userOppositions, activeOpposition, studyCycles, activeStudyCycle]);
  return null;
}
