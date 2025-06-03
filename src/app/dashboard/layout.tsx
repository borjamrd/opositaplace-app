'use client';

import { FloatingAssistantButton } from '@/components/assistant/floating-assistant-button';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { StudyDayNotifications } from '@/components/StudyDayNotifications';
import { SidebarInset } from '@/components/ui/sidebar';
import { useUserSubscription } from '@/lib/supabase/queries/useUserSubscription';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { setSubscription, setLoading, setError } = useSubscriptionStore();
    const { data: activeSubscription, isLoading, error } = useUserSubscription();

    useEffect(() => {
        if (isLoading) {
            setLoading(true);
        } else if (error) {
            setError(error);
            setSubscription(null);
        } else {
            console.log('Active Subscription:', activeSubscription);
            setSubscription(activeSubscription || null);
        }
    }, [activeSubscription, isLoading, error, setSubscription, setLoading, setError]);

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
