// src/app/dashboard/layout.tsx
'use client';

import { FloatingAssistantButton } from '@/components/assistant/floating-assistant-button';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { StudyDayNotifications } from '@/components/StudyDayNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex w-full p-4">
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <main className="flex flex-1 flex-col">
                    <ScrollArea className="flex-1">
                        <main className="p-5">{children}</main>
                    </ScrollArea>
                </main>
            </SidebarInset>
            <FloatingAssistantButton />
            <StudyDayNotifications />
        </div>
    );
}
