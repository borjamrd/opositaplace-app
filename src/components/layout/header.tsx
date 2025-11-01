// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import React from 'react';

import { ThemeToggleButton } from '../ThemeToggleButton';
import { NavUserSection } from './nav-user-section';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import TimerManager from '../TimerManager';
import { AppBreadcrumbs } from './app-breadcrums';

export function Header() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  const getBreadcrumbs = () => {
    const breadcrumbs = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;

      const formattedPath = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        path: formattedPath,
        url,
        isLast,
      };
    });

    return breadcrumbs.length > 0 ? breadcrumbs.slice(1) : [];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between w-full border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          {' '}
          <AppBreadcrumbs />{' '}
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
