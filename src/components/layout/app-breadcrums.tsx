'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const BREADCRUMB_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  review: 'Repetición Espaciada',
  tests: 'Tests',
  profile: 'Perfil',
  'urls-change-history': 'Historial de cambios',
  'practical-cases': 'Casos prácticos',
  roadmap: 'Roadmap',
  statistics: 'Estadísticas',
  'selective-process': 'Proceso Selectivo',
  'opposition-info': 'Información de la oposición',
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store';

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const labels = useBreadcrumbStore((state) => state.labels);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.slice(1).map((segment, index) => {
          const href = `/${segments.slice(0, index + 2).join('/')}`;
          const isLast = index === segments.length - 2;

          const displayName = BREADCRUMB_NAMES[segment] || capitalize(segment);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{labels[segment] || displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{labels[segment] || displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
