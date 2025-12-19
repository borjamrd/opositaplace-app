import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, collapsed }) => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/logo_v3.png"
        width={collapsed ? 40 : 30}
        height={40}
        className={cn('', className)}
        alt="Picture of the author"
      />
      {!collapsed && <span className="text-3xl font-bold text-primary">opositaplace</span>}
    </div>
  );
};
