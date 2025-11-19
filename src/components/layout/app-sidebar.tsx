'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Bell, BookOpen, CheckSquare, Database, LayoutDashboard, Map, Repeat } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Logo } from '../logo';

import OpositionSelector from '../oposition-selector';
import { NavMain } from './nav-main';
import { NavUserSection } from './nav-user-section';

export const sidebarData = {
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
  return (
    <Sidebar className="p-2" variant="floating" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <Logo className="h-8 w-8 flex" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <OpositionSelector />
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUserSection />
      </SidebarFooter>
    </Sidebar>
  );
}
