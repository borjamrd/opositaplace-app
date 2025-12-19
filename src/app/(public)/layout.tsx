import { getSessionData } from '@/lib/supabase/queries/get-session-data';
import { LandingHeader } from '@/components/landing/header';

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await getSessionData();

  return (
    <>
      <LandingHeader profile={profile} />
      <main>{children}</main>
    </>
  );
}
