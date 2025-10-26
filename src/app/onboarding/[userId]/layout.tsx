// src/app/onboarding/layout.tsx

import { StateHydrator } from '@/components/state-hydrator';
import type { ProfileWithOnboarding } from '@/lib/supabase/queries/get-session-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import React from 'react';

async function getProfileData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, onboarding_info(*)')
    .eq('id', user.id)
    .single();

  const profileWithOnboarding: ProfileWithOnboarding | null = profile
    ? { ...profile, onboarding: profile.onboarding_info }
    : null;

  return { profile: profileWithOnboarding };
}

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getProfileData();

  return (
    <>
      <StateHydrator
        profile={profile}
        subscription={undefined}
        userOppositions={undefined}
        activeOpposition={undefined}
        studyCycles={undefined}
        activeStudyCycle={undefined}
      />
      {children}
    </>
  );
}