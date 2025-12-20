'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

interface LandingHeaderProps {
  profile: any;
}

export function LandingHeader({ profile }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <div className="flex justify-center w-full sticky top-4 z-50 pointer-events-none">
      <header
        className={cn(
          'flex items-center justify-between rounded-2xl md:-mb-20 -mb-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 pointer-events-auto',
          isScrolled
            ? 'mt-4 h-14 w-[90%] px-5 md:px-3 px-2 max-w-5xl border bg-background/60 backdrop-blur-xl shadow-sm'
            : 'mt-0 h-20 w-full px-10 md:px-6 px-2 bg-transparent'
        )}
      >
        <Link href="/" className="ml-2">
          <Logo />
        </Link>
        <nav className="mr-2">
          {profile ? (
            <Button asChild size="sm" variant="btn-header">
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="lg" variant="btn-header">
                <Link href="/register">Acceder</Link>
              </Button>
            </div>
          )}
        </nav>
      </header>
    </div>
  );
}
