'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useProfile } from '@/lib/supabase/queries/useProfile';
import { Badge } from '../ui/badge';

export default function UserOnboarding() {
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
            <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-10">
                <p className="text-red-500">Error al cargar el perfil: {error.message}</p>
            </div>
        );
    }

    if (profile?.onboarding) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Preferencias de Estudio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Horas disponibles semanales</p>
                        <p className="font-medium">{profile.onboarding.available_hours} horas</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Días de estudio</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(
                                profile.onboarding.study_days as Record<string, boolean>
                            )
                                .filter(([_, value]) => value)
                                .map(([day]) => (
                                    <Badge key={day}>
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </Badge>
                                ))}
                        </div>
                    </div>
                    {profile.onboarding.help_with &&
                        (profile.onboarding.help_with as string[]).length > 0 && (
                            <div>
                                <p className="text-sm text-muted-foreground">Áreas de ayuda</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(profile.onboarding.help_with as string[]).map((area) => (
                                        <Badge key={area}>{area}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                </CardContent>
            </Card>
        );
    }
}
