// src/components/providers/global-state-loader.tsx
'use client';

import { useProfile } from '@/lib/supabase/queries/useProfile';
import { useUserSubscription } from '@/lib/supabase/queries/useUserSubscription';
import { useProfileStore } from '@/store/profile-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useEffect } from 'react';

export function GlobalStateLoader() {
    const { setSubscription, setLoading: setSubscriptionLoading, setError: setSubscriptionError } = useSubscriptionStore();
    const { setProfile, setLoading: setProfileLoading, setError: setProfileError } = useProfileStore();

    const { data: activeSubscription, isLoading: isLoadingSubscription, error: subscriptionError } = useUserSubscription();
    const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useProfile();

    useEffect(() => {
        if (isLoadingSubscription) {
            setSubscriptionLoading(true);
        } else if (subscriptionError) {
            setSubscriptionError(subscriptionError);
        } else {
            setSubscription(activeSubscription || null);
        }
    }, [activeSubscription, isLoadingSubscription, subscriptionError, setSubscription, setSubscriptionLoading, setSubscriptionError]);

    useEffect(() => {
        if (isLoadingProfile) {
            setProfileLoading(true);
        } else if (profileError) {
            setProfileError(profileError as Error);
        } else {
            setProfile(userProfile || null);
        }
    }, [userProfile, isLoadingProfile, profileError, setProfile, setProfileLoading, setProfileError]);

    return null; 
}