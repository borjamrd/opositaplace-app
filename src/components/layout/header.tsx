// src/components/layout/header.tsx
'use client';


import { ThemeToggleButton } from '../ThemeToggleButton';
import { NavUserSection } from './nav-user-section';

import TimerManager from '../TimerManager';
import { AppBreadcrumbs } from './app-breadcrums';

export function Header() {

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between w-full border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          <AppBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <TimerManager />
        <NavUserSection />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
