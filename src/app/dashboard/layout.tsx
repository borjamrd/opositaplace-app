// src/app/dashboard/layout.tsx
'use client';

import { FloatingAssistantButton } from '@/components/assistant/floating-assistant-button';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { StudyDayNotifications } from '@/components/StudyDayNotifications';
import { SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="min-h-screen flex w-full p-4">
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <main className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-2 p-5">{children}</div>
                </main>
            </SidebarInset>
            <FloatingAssistantButton />
            <StudyDayNotifications />
        </div>
    );
}
