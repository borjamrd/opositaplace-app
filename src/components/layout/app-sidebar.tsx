'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
  ArrowUpCircleIcon,
  Bell,
  BookOpen,
  CheckSquare,
  Database,
  LayoutDashboard,
  Map,
} from 'lucide-react';
import React from 'react';
import Logo from '../logo';
import OpositionSelector from '../oposition-selector';
import { NavMain } from './nav-main';

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
      title: 'Anki',
      url: '/dashboard/anki',
      icon: ArrowUpCircleIcon,
    },
    {
      title: 'Tests',
      url: '/dashboard/tests',
      icon: CheckSquare,
    },
    {
      title: 'Cambios URLS',
      url: '/dashboard/urls-change-history',
      icon: CheckSquare,
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
    <Sidebar className="p-2" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo className="h-8 w-8 flex" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <OpositionSelector />
        <NavMain items={sidebarData.navMain} />
        {/* <NavGeneral items={sidebarData.general} /> */}
      </SidebarContent>
    </Sidebar>
  );
}
