import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Row']
type OnboardingInfo = Database['public']['Tables']['onboarding_info']['Row']

export type ProfileWithOnboarding = Profile & {
  onboarding?: OnboardingInfo
}

async function fetchProfileWithOnboarding(userId: string | null): Promise<ProfileWithOnboarding | null> {
  if (!userId) return null;
  
  const supabase = createClient();
  
  const [profileResult, onboardingResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    supabase
      .from('onboarding_info')
      .select('*')
      .eq('user_id', userId)
      .single()
  ]);

  if (profileResult.error) {
    console.error('Error fetching profile:', profileResult.error);
    return null;
  }

  return {
    ...profileResult.data,
    onboarding: onboardingResult.data || undefined
  };
}

export function useProfile() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return fetchProfileWithOnboarding(user?.id || null);
    }
  });
}