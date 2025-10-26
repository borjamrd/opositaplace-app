'use client';

import { Key, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { useEffect, useState } from 'react';

import UserOnboarding from '../onboarding/user-onboarding';
import UserSubscription from '../subscription/user-suscription';
import DeleteProfile from './delete-profile';
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
        <TabsTrigger value="study">Calendario</TabsTrigger>
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
            {/* Puedes añadir aquí más campos personales si los tienes */}
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
      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Elige qué notificaciones quieres recibir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificaciones por email</Label>
                  <p className="text-muted-foreground text-sm">Recibe notificaciones por correo</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificaciones push</Label>
                  <p className="text-muted-foreground text-sm">
                    Recibe notificaciones push en tu navegador
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Emails de marketing</Label>
                  <p className="text-muted-foreground text-sm">
                    Recibe emails sobre nuevas funciones y actualizaciones
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Resumen semanal</Label>
                  <p className="text-muted-foreground text-sm">
                    Recibe un resumen semanal de tu actividad
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
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
    </Tabs>
  );
}
