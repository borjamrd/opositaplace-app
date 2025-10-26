// src/app/dashboard/profile/notification-settings.tsx
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { updateLoginNotification } from '@/actions/profile';
import { useTransition } from 'react';

interface NotificationSettingsProps {
  currentValue: boolean;
  profileId: string;
}

export function NotificationSettings({ currentValue, profileId }: NotificationSettingsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newValue: boolean) => {
    startTransition(async () => {
      const result = await updateLoginNotification(profileId, newValue);
      if (!result.success) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el cambio.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base">Notificaciones de inicio de sesión</Label>
        <p className="text-muted-foreground text-sm">
          Recibe avisos cuando alguien inicie sesión en tu cuenta.
        </p>
      </div>
      <Switch
        checked={currentValue}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}