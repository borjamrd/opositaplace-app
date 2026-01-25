import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OppositionInfoClient } from './opposition-info-client';
import { redirect } from 'next/navigation';

import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function OppositionInfoPage() {
  const supabase = await createSupabaseServerClient();
  const { subscription } = await getSessionData();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const isPremium =
    subscription?.price_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID ||
    subscription?.price_id === 'price_premium_placeholder';

  return <OppositionInfoClient isPremium={isPremium} />;
}
