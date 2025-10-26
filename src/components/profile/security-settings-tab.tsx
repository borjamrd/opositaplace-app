// src/app/dashboard/profile/security-settings-tab.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProfileStore } from '@/store/profile-store';
import { PasswordSettings } from './password-settings';
import { TwoFactorSettings } from './two-factor-settings';
import { NotificationSettings } from './notification-settings';
import { SessionManagement } from './session-management';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '../ui/tabs';

// Este es el componente principal que renderiza el TabsContent
export function SecuritySettingsTab() {
  // Obtenemos el perfil de nuestro store (que se carga en el layout)
  const { profile, isLoading } = useProfileStore();

  if (isLoading || !profile) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <TabsContent value="security" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Gestiona la seguridad y autenticación de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile && profile.email && <PasswordSettings userEmail={profile.email} />}
          <Separator />
          <TwoFactorSettings />
          <Separator />
          {/* <NotificationSettings
            currentValue={profile.notify_on_new_login ?? true}
            profileId={profile.id}
          /> */}
          <Separator />
          <SessionManagement />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
