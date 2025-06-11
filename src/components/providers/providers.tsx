'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { queryClient } from '@/lib/react-query/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
export default function Providers({ children }: { children: React.ReactNode }) {
   

    return (
        <SidebarProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SidebarProvider>
    );
}
