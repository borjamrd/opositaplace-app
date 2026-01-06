import { Playfair_Display } from 'next/font/google';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className={playfair.variable}>{children}</main>
    </>
  );
}
