// src/components/layout/header.tsx
'use client';

import { ThemeToggleButton } from '../ThemeToggleButton';

import TimerManager from '../TimerManager';
import { SidebarTrigger } from '../ui/sidebar';
import { AppBreadcrumbs } from './app-breadcrums';
import { FeedbackButton } from './feedback-button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between w-full border-b border-border/40 bg-background px-4  md:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          <SidebarTrigger className="m-4" />
          <AppBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <TimerManager />
        <FeedbackButton />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
