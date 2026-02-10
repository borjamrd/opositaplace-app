'use client';

import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store';
import { useEffect } from 'react';

interface BreadcrumbUpdaterProps {
  segment: string;
  label: string;
}

export function BreadcrumbUpdater({ segment, label }: BreadcrumbUpdaterProps) {
  const setLabel = useBreadcrumbStore((state) => state.setLabel);

  useEffect(() => {
    setLabel(segment, label);
  }, [segment, label, setLabel]);

  return null;
}
