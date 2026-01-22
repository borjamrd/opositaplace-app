import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OppositionInfoClient } from './opposition-info-client';
import { redirect } from 'next/navigation';

export default async function OppositionInfoPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <OppositionInfoClient />;
}
