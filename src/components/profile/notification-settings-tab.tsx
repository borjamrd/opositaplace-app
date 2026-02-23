// src/app/dashboard/profile/notification-settings-tab.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import { useProfileStore } from '@/store/profile-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransition } from 'react';
import { updateProfileSettings } from '@/actions/profile';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileSettingKey = keyof Profile;

export function NotificationSettingsTab() {
  const { profile, isLoading } = useProfileStore();
  const [isPending, startTransition] = useTransition();

  if (isLoading || !profile) {
    return <NotificationSkeleton />;
  }

  const handleToggle = (field: ProfileSettingKey, value: boolean) => {
    startTransition(async () => {
      const result = await updateProfileSettings(profile.id, { [field]: value });
      if (!result.success) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar tu preferencia.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <TabsContent value="notifications" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Elige qué notificaciones quieres recibir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <NotificationToggleRow
              label="Notificaciones por email"
              description="Recibe notificaciones por correo"
              field="notify_by_email"
              value={profile.notify_by_email}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />
            <NotificationToggleRow
              label="Notificaciones push"
              description="Recibe notificaciones push en tu navegador"
              field="notify_by_push"
              value={profile.notify_by_push}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />
            <NotificationToggleRow
              label="Emails de marketing"
              description="Recibe emails sobre nuevas funciones y actualizaciones"
              field="notify_marketing_emails"
              value={profile.notify_marketing_emails}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />
            <NotificationToggleRow
              label="Resumen semanal"
              description="Recibe un resumen semanal de tu actividad"
              field="notify_weekly_summary"
              value={profile.notify_weekly_summary}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />

            <NotificationToggleRow
              label="Notificaciones de inicio de sesión"
              description="Recibe avisos cuando alguien inicie sesión en tu cuenta"
              field="notify_on_new_login"
              value={profile.notify_on_new_login}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />

            <NotificationToggleRow
              label="Recordatorio de estudio"
              description="Recibe recordatorios para estudiar"
              field="notify_study_reminder"
              value={profile.notify_study_reminder}
              onToggle={handleToggle}
              isPending={isPending}
            />
            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Alertas de seguridad</Label>
                <p className="text-muted-foreground text-sm">
                  Notificaciones de seguridad importantes (siempre activadas)
                </p>
              </div>
              <Switch checked disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  field: ProfileSettingKey;
  value: boolean;
  onToggle: (field: ProfileSettingKey, value: boolean) => void;
  isPending: boolean;
}

function NotificationToggleRow({
  label,
  description,
  field,
  value,
  onToggle,
  isPending,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base">{label}</Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={(newValue) => onToggle(field, newValue)}
        disabled={isPending}
      />
    </div>
  );
}

// Esqueleto de carga
function NotificationSkeleton() {
  return (
    <TabsContent value="notifications" className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
