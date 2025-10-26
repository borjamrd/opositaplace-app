// src/app/dashboard/profile/session-management.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';
import { useState } from 'react';

export function SessionManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOutOthers = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: 'others' });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Se han cerrado todas las demás sesiones.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base">Sesiones activas</Label>
        <p className="text-muted-foreground text-sm">
          Cierra la sesión en todos los demás dispositivos.
        </p>
      </div>
      <Button variant="outline" onClick={handleSignOutOthers} disabled={isLoading}>
        <Shield className="mr-2 h-4 w-4" />
        {isLoading ? 'Cerrando...' : 'Cerrar otras sesiones'}
      </Button>
    </div>
  );
}
