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
} from '@/components/ui/breadcrumb'; // Usando tu componente UI

// El mapa de traducción
const BREADCRUMB_NAMES: Record<string, string> = {
  'dashboard': 'Panel',
  'review': 'Repetición Espaciada',
  'tests': 'Tests',
  'profile': 'Perfil',
  'urls-change-history': 'Historial de Cambios',
};

// Función simple para poner en mayúscula la primera letra
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  // Divide la ruta y filtra segmentos vacíos (por el '/' inicial)
  const segments = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {/* Siempre añadimos un item "Home" o "Dashboard" al inicio */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Panel</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Mapeamos los segmentos de la URL */}
        {segments.slice(1).map((segment, index) => {
          // Reconstruimos la URL para cada "migaja"
          const href = `/${segments.slice(0, index + 2).join('/')}`;
          const isLast = index === segments.length - 2;

          // --- ¡LA MAGIA ESTÁ AQUÍ! ---
          // 1. Buscamos en nuestro mapa
          // 2. Si no existe, usamos el nombre del segmento capitalizado como fallback
          const displayName = BREADCRUMB_NAMES[segment] || capitalize(segment);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  // El último item no es un link
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  // Los items intermedios sí son links
                  <BreadcrumbLink asChild>
                    <Link href={href}>{displayName}</Link>
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