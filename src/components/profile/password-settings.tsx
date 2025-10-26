// src/app/dashboard/profile/password-settings.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Key } from 'lucide-react';
import { useState } from 'react';

interface PasswordSettingsProps {
  userEmail: string;
}

export function PasswordSettings({ userEmail }: PasswordSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para cambiar tu contraseña.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base">Contraseña</Label>
        <p className="text-muted-foreground text-sm">
          Recibirás un correo para cambiar tu contraseña.
        </p>
      </div>
      <Button variant="outline" onClick={handleChangePassword} disabled={isLoading}>
        <Key className="mr-2 h-4 w-4" />
        {isLoading ? 'Enviando...' : 'Cambiar contraseña'}
      </Button>
    </div>
  );
}
