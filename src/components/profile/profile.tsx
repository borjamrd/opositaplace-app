'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { User } from 'lucide-react';

import UserOnboarding from '../onboarding/user-onboarding';
import UserSubscription from '../subscription/user-suscription';

export default function Profile() {
    const { data: profile, isLoading, error } = useProfile();

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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <Avatar className="h-16 w-16 rounded-full">
                        <AvatarImage
                            className="rounded-full aspect-square"
                            src={profile?.avatar_url || ''}
                            alt="Avatar"
                        />
                        <AvatarFallback>
                            <User className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile?.email || 'No disponible'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Usuario</p>
                        <p className="font-medium">{profile?.username || 'No configurado'}</p>
                    </div>
                    {/* Podrías añadir un botón para editar perfil aquí */}
                </CardContent>
            </Card>

            <UserOnboarding />
            <UserSubscription />
        </div>
    );
}
