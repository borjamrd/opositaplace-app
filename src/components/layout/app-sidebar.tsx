"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  ArrowUpCircleIcon,
  Bell,
  BookOpen,
  CheckSquare,
  Database,
  LayoutDashboard,
  Map
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Logo from "../logo";
// import { NavMain } from "@components/layout/nav-main"

export const sidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Roadmap",
      url: "/dashboard/roadmap",
      icon: Map,
    },
    {
      title: "Anki",
      url: "/dashboard/anki",
      icon: ArrowUpCircleIcon,
    },
    {
      title: "Tests",
      url: "/dashboard/tests",
      icon: CheckSquare,
    },
  ],
  general: [
    {
      name: "Recursos",
      url: "/dashboard/mis-recursos",
      icon: Database,
    },
    {
      name: "Notificaciones",
      url: "/dashboard/mis-notificaciones",
      icon: Bell,
    },
    {
      name: "Oposiciones",
      url: "/dashboard/oposiciones",
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
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link className="flex items-center gap-2 font-lora" href={"/"}>
                <Logo className="h-8 w-8 flex" />
                <span className="text-base font-semibold">opositaplace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* <OpositionSelector /> */}
        {/* <NavMain items={sidebarData.navMain} /> */}
        {/* <NavGeneral items={sidebarData.general} /> */}
      </SidebarContent>

      <SidebarFooter>
        {/* <NavUser /> */}
      </SidebarFooter>
    </Sidebar>
  );
}