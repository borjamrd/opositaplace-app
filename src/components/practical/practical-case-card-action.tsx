'use client';

import { PremiumFeatureModal } from '@/components/subscription/premium-feature-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PracticalCaseCardActionProps {
  caseId: string;
  isPremium: boolean;
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function PracticalCaseCardAction({
  caseId,
  isPremium,
  className,
  children,
  variant = 'default',
}: PracticalCaseCardActionProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPremium) {
      router.push(`/dashboard/practical-cases/${caseId}`);
    } else {
      setShowPremiumModal(true);
    }
  };

  return (
    <>
      <PremiumFeatureModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Los casos prácticos con corrección por IA"
      />
      <Button variant={variant} className={cn('w-full', className)} onClick={handleClick}>
        {children}
      </Button>
    </>
  );
}
