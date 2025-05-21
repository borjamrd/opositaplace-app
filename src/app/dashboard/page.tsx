"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar"; // Assuming this path
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header"; // Assuming this path
import { DashboardContent } from "@/components/dashboard/dashboard-content"; // Assuming this path

const Dashboard = () => {
  const pathname = usePathname();
  const isRootDashboard = pathname === "/dashboard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full p-4">
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 p-5">
              {isRootDashboard ?
                <DashboardContent />
                : null}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
