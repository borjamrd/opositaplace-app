'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useProfile } from '@/lib/supabase/queries/useProfile';
import SelectedSlotsSummary from '../weekly-planner/SelectedSlotsSummary';
import { SelectedSlots } from '../weekly-planner/types';

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

    const transformStudyDays = (studyDays: any): SelectedSlots => {
        if (!studyDays || typeof studyDays !== 'object') {
            return {} as SelectedSlots;
        }
        return studyDays as SelectedSlots;
    };

    const transformObjectives = (objectives: any): string[] => {
        if (!objectives || typeof objectives !== 'object') {
            return [];
        }
        return Object.values(objectives) as string[];
    };

    if (profile?.onboarding) {
        return (
            <Card className="w-full rounded-lg shadow-md">
                <CardContent className="space-y-4 pt-6">
                    <div>
                        <SelectedSlotsSummary
                            selectedSlots={transformStudyDays(profile.onboarding.study_days)}
                        />
                    </div>

                    {profile.onboarding.help_with &&
                        (profile.onboarding.help_with as string[]).length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-600">Áreas de ayuda</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(profile.onboarding.help_with as string[]).map((area) => (
                                        <Badge key={area} variant={'outline'}>{area}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    <div>
                        <p className="text-sm font-medium text-gray-600">Objetivos</p>
                        <div className="text-sm text-gray-500">
                            {transformObjectives(profile.onboarding.objectives).map((objective, index) => (
                                <p key={index}>- {objective}</p>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
