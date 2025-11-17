// src/app/onboarding/layout.tsx

import { getProfileData } from '@/actions/profile';
import { StateHydrator } from '@/components/state-hydrator';
import React from 'react';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
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
