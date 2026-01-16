'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface InfoSidebarProps {
  children: React.ReactNode;
}

// Componente para detectar el clic fuera
function SidebarOverlay() {
  const { open, setOpen } = useSidebar();

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className={cn('absolute inset-0 z-40', 'pointer-events-auto')}
    />
  );
}

interface InfoSidebarProps {
  children: React.ReactNode;
}

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InfoSidebar({ children }: InfoSidebarProps) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '24rem' } as React.CSSProperties}
      className="absolute top-2 right-2 pointer-events-none z-50 flex-row-reverse h-[calc(100%-1rem)]"
    >
      <SidebarOverlay />
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <InfoTrigger />
      </div>

      <Sidebar
        side="right"
        collapsible="offcanvas"
        variant="sidebar"
        className="pointer-events-auto !absolute h-full"
      >
        <SidebarContent className="h-full bg-background border-l shadow-xl rounded-l-xl">
          {children}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

function InfoTrigger() {
  const { toggleSidebar, open } = useSidebar();

  if (open) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="size-7 text-muted-foreground hover:bg-slate-100"
    >
      <Info className="h-5 w-5" />
    </Button>
  );
}
