import LandingContent from '@/components/landing/landing-content';
import { LandingHeader } from '@/components/landing/header';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function LandingPage() {
  const { profile } = await getSessionData();

  return (
    <>
      <LandingHeader profile={profile} />
      <LandingContent />
    </>
  );
}
