'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

import UserOnboarding from '../onboarding/user-onboarding';
import UserSubscription from '../subscription/user-suscription';

export default function Profile() {
    const { data: profile, isLoading, error, refetch } = useProfile();

    const [username, setUsername] = useState(profile?.username || '');
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
        }
    }
    , [profile]);

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

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${profile?.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (!profile?.id) {
                throw new Error('Perfil no encontrado.');
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile?.id);

            if (updateError) throw updateError;

            toast({
                title: 'Éxito',
                description: 'Foto de perfil actualizada correctamente',
            });
            refetch();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Error al actualizar la foto de perfil',
            });
        } finally {
            setUploading(false);
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage
                                className="rounded-full aspect-square"
                                src={profile?.avatar_url || ''}
                                alt="Avatar"
                            />
                            <AvatarFallback>
                                <User className="h-8 w-8" />
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            onClick={() => document.getElementById('avatar')?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Subiendo...' : 'Cambiar foto'}
                        </Button>
                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={uploadAvatar}
                            className="hidden"
                        />
                    </div>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Email</Label>
                        <Input type="email" value={profile?.email || ''} disabled />
                    </div>
                    <div>
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
                </CardContent>
            </Card>

            <UserOnboarding />
            <UserSubscription />
        </div>
    );
}
