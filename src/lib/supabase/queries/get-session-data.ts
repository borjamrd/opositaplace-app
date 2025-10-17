// src/lib/supabase/queries/get-session-data.ts
import 'server-only'; // Asegura que este código solo se ejecute en el servidor
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

// Tipos para mayor claridad
type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];
type Opposition = Database['public']['Tables']['oppositions']['Row'];
type StudyCycle = Database['public']['Tables']['user_study_cycles']['Row'];
type OnboardingInfo = Database['public']['Tables']['onboarding_info']['Row'];

export type ProfileWithOnboarding = Profile & {
  onboarding?: OnboardingInfo | null;
};

// Objeto de retorno unificado para toda la sesión del usuario
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
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, devolvemos un estado vacío
    return {
      profile: null,
      subscription: null,
      userOppositions: [],
      activeOpposition: null,
      studyCycles: [],
      activeStudyCycle: null,
    };
  }

  // --- 1. Obtener Perfil y Suscripción en paralelo ---
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

  // --- 2. Obtener las oposiciones del usuario ---
  const { data: userOppositionsData, error: userOppositionsError } = await supabase
    .from('user_oppositions')
    .select('active, oppositions(*)')
    .eq('profile_id', user.id);

  if (userOppositionsError) {
    console.error('Error fetching user oppositions:', userOppositionsError);
    // Devuelve un estado parcial si falla esta parte
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

  // --- 3. Si hay una oposición activa, obtener sus ciclos ---
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
