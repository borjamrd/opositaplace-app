"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/lib/supabase/queries/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { User } from "lucide-react";

export default function Profile() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="container flex flex-col gap-4 px-4 md:px-10">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex flex-col gap-4 px-4 md:px-10">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-destructive">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="container flex flex-col gap-6 px-4 md:px-10">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Avatar className="h-16 w-16 rounded-full">
              <AvatarImage
                className="rounded-full aspect-square"
                src={profile?.avatar_url || ""}
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
              <p className="font-medium">{profile?.email || "No disponible"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">
                {profile?.username || "No configurado"}
              </p>
            </div>
          </CardContent>
        </Card>

        {profile?.onboarding && (
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Estudio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Horas disponibles semanales
                </p>
                <p className="font-medium">
                  {profile.onboarding.available_hours} horas
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Días de estudio</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(
                    profile.onboarding.study_days as Record<string, boolean>
                  )
                    .filter(([_, value]) => value)
                    .map(([day]) => (
                      <span
                        key={day}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10"
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    ))}
                </div>
              </div>
              {profile.onboarding.help_with && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Áreas de ayuda
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(profile.onboarding.help_with as string[]).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 text-xs rounded-full bg-secondary/10"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
