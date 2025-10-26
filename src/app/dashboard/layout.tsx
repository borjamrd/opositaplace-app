// src/app/dashboard/layout.tsx


import { FloatingAssistantButton } from '@/components/assistant/floating-assistant-button';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';
import { StateHydrator } from '@/components/state-hydrator';
import { StudyDayNotifications } from '@/components/StudyDayNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset } from '@/components/ui/sidebar';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    profile,
    subscription,
    userOppositions,
    activeOpposition,
    studyCycles,
    activeStudyCycle,
  } = await getSessionData();
  return (
    <div className="flex w-full p-4">
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <StateHydrator
          profile={profile}
          subscription={subscription}
          userOppositions={userOppositions}
          activeOpposition={activeOpposition}
          studyCycles={studyCycles}
          activeStudyCycle={activeStudyCycle}
        />
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
