'use client';

import * as React from 'react';
import { InfoSidebar } from '@/components/info-sidebar';

interface PageContainerProps {
  children: React.ReactNode;
  infoContent?: React.ReactNode;
}

export function PageContainer({ children, infoContent }: PageContainerProps) {
  return (
    <div className="flex-1 p-3 md:p-10 relative min-h-screen">
      {infoContent && <InfoSidebar>{infoContent}</InfoSidebar>}
      {children}
    </div>
  );
}
