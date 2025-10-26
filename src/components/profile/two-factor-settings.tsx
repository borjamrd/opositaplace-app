// src/app/dashboard/profile/two-factor-settings.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
// Necesitarás crear este componente Dialog
// import { TwoFactorDialog } from './two-factor-dialog';
import { useState } from 'react';

export function TwoFactorSettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Usamos React Query para cargar el estado REAL de MFA
  const { data, isLoading } = useQuery({
    queryKey: ['mfa-status'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      // 'totp' son los factores de apps de autenticación (Google Auth, etc.)
      const isMfaEnabled = data.all.some(
        (f) => f.factor_type === 'totp' && f.status === 'verified'
      );
      return { isMfaEnabled, factors: data.all };
    },
  });

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base">Doble factor de autenticación (2FA)</Label>
        <p className="text-muted-foreground text-sm">Añade una capa extra de seguridad.</p>
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : data?.isMfaEnabled ? (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Activado
          </Badge>
        ) : (
          <Badge variant="destructive">Desactivado</Badge>
        )}
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          Configurar
        </Button>
      </div>

      {/* <TwoFactorDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentStatus={data}
      />
      */}
    </div>
  );
}
