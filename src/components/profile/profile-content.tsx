'use client';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { useEffect, useState } from 'react';

import UserOnboarding from '../onboarding/user-onboarding';
import UserSubscription from '../subscription/user-suscription';
import DeleteProfile from './delete-profile';
import { NotificationSettingsTab } from './notification-settings-tab';
import { SecuritySettingsTab } from './security-settings-tab';

export default function ProfileContent() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const { toast } = useToast();
  const supabase = createClient();
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  const updateUsername = async () => {
    if (!username.trim() || !profile?.id) return;

    const { error } = await supabase.from('profiles').update({ username }).eq('id', profile.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el nombre de usuario',
      });
    } else {
      toast({
        title: 'Éxito',
        description: 'Nombre de usuario actualizado correctamente',
      });
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="container flex flex-col gap-4 px-4 md:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px] md:col-span-2 lg:col-span-1" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex flex-col gap-4 px-4 md:px-10">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-destructive">No se pudo cargar el perfil.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
        <TabsTrigger value="study">Onboarding</TabsTrigger>
        <TabsTrigger value="security">Seguridad</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
      </TabsList>
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tus datos personales y de perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={profile?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nombre de usuario</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Introduce tu nombre de usuario"
                  />
                  <Button onClick={updateUsername}>Guardar</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha de creación</Label>
                <Input
                  type="text"
                  value={new Date(profile?.created_at || '').toLocaleDateString()}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Última actualización</Label>
                <Input
                  type="text"
                  value={new Date(profile?.updated_at || '').toLocaleDateString()}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="space-y-6">
        <UserSubscription />
        <DeleteProfile />
      </TabsContent>
      <TabsContent value="study" className="space-y-6">
        <UserOnboarding />
      </TabsContent>
      <SecuritySettingsTab />
      <NotificationSettingsTab />
    </Tabs>
  );
}
