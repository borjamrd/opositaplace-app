'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { Calendar, Camera, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ProfileHeader() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setUsername(profile.username || '');
  }, [profile]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!profile?.id) throw new Error('Perfil no encontrado.');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      toast({ title: 'Éxito', description: 'Foto de perfil actualizada correctamente' });
      refetch();
    } catch {
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <div className="animate-pulse h-24 w-24 bg-muted rounded-full mb-4" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 bg-muted rounded mb-2 animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded mb-1 animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">No se pudo cargar el perfil.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt="Profile"
                className="rounded-full aspect-square object-cover object-center"
              />
              <AvatarFallback className="text-2xl">
                {profile.username?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Cambiar foto de perfil"
            >
              <Camera />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {profile.username || 'Sin nombre'}
              </h1>
            </div>
            {/* <p className="text-muted-foreground">{profile.bio || "Sin biografía"}</p> */}
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {profile.email}
              </div>
              {/* {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {profile.location}
                </div>
              )} */}
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                {profile.created_at
                  ? `Miembro desde ${new Date(profile.created_at).toLocaleDateString()}`
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
