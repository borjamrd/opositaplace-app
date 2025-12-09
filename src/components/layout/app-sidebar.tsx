'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
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
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Logo } from '../logo';

import { FloatingAssistantButton } from '@/components/assistant/floating-assistant-button';
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
              <Logo className="h-8 w-8 flex" collapsed={props.collapsible === 'icon'} />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <OpositionSelector />
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <FloatingAssistantButton />
        <NavUserSection />
      </SidebarFooter>
    </Sidebar>
  );
}
