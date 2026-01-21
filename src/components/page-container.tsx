'use client';

import * as React from 'react';
import { DrawerInfo } from '@/components/drawer-info';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageContainerProps {
  title?: string;
  children: React.ReactNode;
  infoContent?: React.ReactNode;
  showBackButton?: boolean;
}

export function PageContainer({
  title,
  children,
  infoContent,
  showBackButton = true,
}: PageContainerProps) {
  return (
    <div className="flex-1 container mx-auto mt-5 md:mt-10 relative">
      <div className={'flex gap-7 mb-4 items-baseline'}>
        {showBackButton && (
          <Button onClick={() => history.back()} size="sm" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        )}
        {title && <h1 className="text-2xl text-primary font-bold font-newsreader">{title}</h1>}
        <div className="ms-auto flex-1">
          {infoContent && <DrawerInfo>{infoContent}</DrawerInfo>}
        </div>
      </div>
      <div className="flex-1 relative">{children}</div>
    </div>
  );
}
