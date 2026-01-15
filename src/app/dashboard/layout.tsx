// src/app/dashboard/layout.tsx
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { StateHydrator } from '@/components/state-hydrator';
import { StudyDayNotifications } from '@/components/StudyDayNotifications';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await getSessionData();

  return (
    <>
      <StateHydrator {...sessionData} />
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-3 md:p-10">{children}</main>
        </div>
      </div>
      <StudyDayNotifications />
    </>
  );
}
