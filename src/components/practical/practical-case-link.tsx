'use client';

import { PremiumFeatureModal } from '@/components/subscription/premium-feature-modal';
import Link, { LinkProps } from 'next/link';
import { useState } from 'react';

interface PracticalCaseLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string; // Permitir pasar className
  isPremium: boolean;
  featureName?: string;
}

export function PracticalCaseLink({
  children,
  isPremium,
  featureName = 'Casos prácticos',
  ...props
}: PracticalCaseLinkProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isPremium) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <Link {...props} onClick={handleClick}>
        {children}
      </Link>

      <PremiumFeatureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName={featureName}
      />
    </>
  );
}
