"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { FloatingAssistantButton } from "@/components/assistant/floating-assistant-button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SidebarProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex w-full p-4">
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <main className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2 p-5">
                {children}
              </div>
            </main>
          </SidebarInset>
          <FloatingAssistantButton />
        </div>
      </QueryClientProvider>
    </SidebarProvider>
  );
}
