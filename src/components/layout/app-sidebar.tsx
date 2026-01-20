'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import {
  Bell,
  BookOpen,
  Briefcase,
  CheckSquare,
  Database,
  LayoutDashboard,
  Map,
  Repeat,
  Milestone,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Logo } from '../logo';

import { useStudySessionStore } from '@/store/study-session-store';
import OpositionSelector from '../oposition-selector';
import { NavMain } from './nav-main';
import { NavUserSection } from './nav-user-section';

export const baseNavItems = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    // {
    //   title: 'Estadísticas',
    //   url: '/dashboard/statistics',
    //   icon: PieChart,
    // },
    {
      title: 'Roadmap',
      url: '/dashboard/roadmap',
      icon: Map,
    },
    {
      title: 'Tests',
      url: '/dashboard/tests',
      icon: CheckSquare,
    },
    {
      title: 'Repetición espaciada',
      url: '/dashboard/review',
      icon: Repeat,
    },
    {
      title: 'Procesos selectivos',
      url: '/dashboard/selective-process',
      icon: Milestone,
    },
  ],
  general: [
    {
      name: 'Recursos',
      url: '/dashboard/mis-recursos',
      icon: Database,
    },
    {
      name: 'Notificaciones',
      url: '/dashboard/mis-notificaciones',
      icon: Bell,
    },
    {
      name: 'Oposiciones',
      url: '/dashboard/oposiciones',
      icon: BookOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const activeOpposition = useStudySessionStore((state) => state.activeOpposition);
  const { state, isMobile } = useSidebar();

  const navItems = useMemo(() => {
    const items = [...baseNavItems.navMain];

    if (activeOpposition?.metadata?.features?.has_practical_case) {
      items.push({
        title: 'Casos prácticos',
        url: '/dashboard/practical-cases',
        icon: Briefcase,
      });
    }

    return items;
  }, [activeOpposition]);
  return (
    <Sidebar className="p-2" variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <Logo className="h-8 w-8 flex" collapsed={state === 'collapsed' && !isMobile} />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <OpositionSelector collapsed={state === 'collapsed' && !isMobile} />
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUserSection collapsed={state === 'collapsed' && !isMobile} />
      </SidebarFooter>
    </Sidebar>
  );
}
