'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../logo';
import { ThemeToggleButton } from '../ThemeToggleButton';
import { NavUserSection } from './nav-user-section';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (isMounted) {
        setUser(data.user);
        setLoading(false);
      }
    }

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (_event !== 'INITIAL_SESSION') setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const showNavbar = !pathname.startsWith('/onboarding/');
  if (!showNavbar) {
    return null;
  }

  const renderAuthLinks = () => (
    <nav className="flex items-center gap-4">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/plans">Planes</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/login">Inicia sesión</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Regístrate</Link>
        </Button>
      </div>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 md:px-10 flex h-14 items-center justify-between py-1">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        <div className="flex w-full justify-end items-center space-x-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <NavUserSection />
          ) : (
            renderAuthLinks()
          )}
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
