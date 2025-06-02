'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SidebarProvider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </SidebarProvider>
    );
}
