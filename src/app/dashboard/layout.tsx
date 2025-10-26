// src/app/dashboard/layout.tsx
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { StateHydrator } from '@/components/state-hydrator';
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

      <div className="flex">
        <AppSidebar />
        <main className="flex-1">
          <Header />
          {children}
        </main>
      </div>
    </>
  );
}
