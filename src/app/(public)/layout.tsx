// src/app/(public)/layout.tsx
import { getSessionData } from '@/lib/supabase/queries/get-session-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';


async function LandingHeader() {
  const { profile } = await getSessionData();

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 md:px-6">
      <Link href="/">
        <Logo />
      </Link>
      <nav>
        {profile ? (
          <Button asChild size="sm">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
// --- Fin del Header Público ---

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingHeader />
      <main>{children}</main>
    </>
  );
}
