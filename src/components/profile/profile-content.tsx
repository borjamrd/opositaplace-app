'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import UserOnboarding from '../onboarding/user-onboarding';
import UserSubscription from '../subscription/user-suscription';
import DeleteProfile from './delete-profile';
import { InterfaceSettingsTab } from './interface-settings-tab';
import { NotificationSettingsTab } from './notification-settings-tab';
import { SecuritySettingsTab } from './security-settings-tab';

export default function ProfileContent() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [activeTab, setActiveTab] = useState('personal');
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

  const isDropdownActive = ['security', 'notifications', 'interface'].includes(activeTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
        <TabsTrigger value="study">Onboarding</TabsTrigger>

        {/* Desktop triggers */}
        <TabsTrigger value="security" className="hidden md:inline-flex">
          Seguridad
        </TabsTrigger>
        <TabsTrigger value="notifications" className="hidden md:inline-flex">
          Notificaciones
        </TabsTrigger>
        <TabsTrigger value="interface" className="hidden md:inline-flex">
          Interfaz
        </TabsTrigger>

        {/* Mobile dropdown trigger */}
        <div className="flex items-center justify-center md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${isDropdownActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab('security')}>
                Seguridad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('notifications')}>
                Notificaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('interface')}>
                Interfaz
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      <InterfaceSettingsTab />
      <SecuritySettingsTab />
      <NotificationSettingsTab />
    </Tabs>
  );
}
