// src/lib/supabase/queries/get-session-data.ts
"use server";

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Opposition, ProfileWithOnboarding, StudyCycle, Subscription } from '../types';


export interface UserSessionData {
  profile: ProfileWithOnboarding | null;
  subscription: Subscription | null;
  userOppositions: Opposition[];
  activeOpposition: Opposition | null;
  studyCycles: StudyCycle[];
  activeStudyCycle: StudyCycle | null;
}

/**
 * Obtiene todos los datos de sesión esenciales para un usuario autenticado.
 */
export async function getSessionData(): Promise<UserSessionData> {

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      subscription: null,
      userOppositions: [],
      activeOpposition: null,
      studyCycles: [],
      activeStudyCycle: null,
    };
  }

  const [profileResult, subscriptionResult] = await Promise.all([
    supabase.from('profiles').select('*, onboarding_info(*)').eq('id', user.id).single(),
    supabase
      .from('user_subscriptions')
      .select('*')
      .in('status', ['trialing', 'active'])
      .maybeSingle(),
  ]);

  const profile: ProfileWithOnboarding | null = profileResult.data
    ? { ...profileResult.data, onboarding: profileResult.data.onboarding_info }
    : null;
  const subscription: Subscription | null = subscriptionResult.data;

  const { data: userOppositionsData, error: userOppositionsError } = await supabase
    .from('user_oppositions')
    .select('active, oppositions(*)')
    .eq('profile_id', user.id);

  if (userOppositionsError) {
    console.error('Error fetching user oppositions:', userOppositionsError);
    return {
      profile,
      subscription,
      userOppositions: [],
      activeOpposition: null,
      studyCycles: [],
      activeStudyCycle: null,
    };
  }

  const userOppositions: Opposition[] =
    (userOppositionsData?.map((uo) => uo.oppositions).filter(Boolean) as Opposition[]) || [];
  const activeUserOppositionRelation = userOppositionsData?.find((uo) => uo.active);
  const activeOpposition: Opposition | null =
    (activeUserOppositionRelation?.oppositions as Opposition) || userOppositions[0] || null;

  let studyCycles: StudyCycle[] = [];
  let activeStudyCycle: StudyCycle | null = null;

  if (activeOpposition) {
    const { data: cyclesData, error: cyclesError } = await supabase
      .from('user_study_cycles')
      .select('*')
      .eq('user_id', user.id)
      .eq('opposition_id', activeOpposition.id)
      .order('cycle_number', { ascending: true });

    if (cyclesError) {
      console.error('Error fetching study cycles:', cyclesError);
    } else if (cyclesData) {
      studyCycles = cyclesData;
      activeStudyCycle = studyCycles.find((c) => !c.completed_at) ?? studyCycles[0] ?? null;
    }
  }

  return {
    profile,
    subscription,
    userOppositions,
    activeOpposition,
    studyCycles,
    activeStudyCycle,
  };
}
