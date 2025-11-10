// src/app/(public)/layout.tsx
import { getSessionData } from '@/lib/supabase/queries/get-session-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

async function LandingHeader() {
  const { profile } = await getSessionData();

  return (
    <header className="sticky top-5 b-20 z-50 flex h-16 w-full items-center backdrop-blur-md justify-between border-b bg-background/75 px-4 md:px-6 max-w-5xl mx-auto rounded-4xl">
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
            <Button asChild size="lg" className='rounded-3xl'>
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}

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
