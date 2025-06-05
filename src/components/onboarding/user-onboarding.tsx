'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

import { useProfile } from '@/lib/supabase/queries/useProfile';
import { useCallback, useEffect, useState } from 'react';
import SelectedSlotsSummary from '../weekly-planner/SelectedSlotsSummary';
import SlotDurationSelector from '../weekly-planner/SlotDurationSelector';
import WeeklyPlanner from '../weekly-planner/WeeklyPlanner';
import { DAYS_OF_WEEK_ORDERED, generateTimeSlots } from '../weekly-planner/constants';
import { Day, SelectedSlots } from '../weekly-planner/types';
import { initializeSelectedSlots, parseSlotToMinutes } from '../weekly-planner/utils';

export default function UserOnboarding() {
    const { data: profile, isLoading, error } = useProfile();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [slotDuration, setSlotDuration] = useState<number>(30); // Default duration
    const [currentTimeSlots, setCurrentTimeSlots] = useState<string[]>(() => generateTimeSlots(30));

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
    const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>(() =>
        transformStudyDays(profile?.onboarding?.study_days)
    );

    const handleDurationChange = useCallback((newDuration: number) => {
        setSlotDuration(newDuration);
        setCurrentTimeSlots(generateTimeSlots(newDuration));
    }, []);

    const handleToggleSlot = useCallback((day: Day, timeSlot: string) => {
        setSelectedSlots((prev) => {
            const currentDaySlots = prev[day] || {};
            const wasSelected = currentDaySlots[timeSlot];

            if (typeof wasSelected === 'undefined') {
                return prev;
            }

            const newDaySlots = { ...currentDaySlots };
            newDaySlots[timeSlot] = !newDaySlots[timeSlot];

            return {
                ...prev,
                [day]: newDaySlots,
            };
        });
    }, []);

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

    useEffect(() => {
        const newTimeSlots = generateTimeSlots(slotDuration);
        setCurrentTimeSlots(newTimeSlots);

        setSelectedSlots((prevSelectedSlots) => {
            const newInitializedSlots = initializeSelectedSlots(newTimeSlots); // All false initially

            DAYS_OF_WEEK_ORDERED.forEach((day) => {
                // Ensure prevSelectedSlots[day] exists; otherwise, there's nothing to migrate for this day
                if (!prevSelectedSlots || !prevSelectedSlots[day]) return;

                newTimeSlots.forEach((newSlotString) => {
                    const newSlotTimes = parseSlotToMinutes(newSlotString);
                    if (!newSlotTimes) return; // Couldn't parse the new slot string

                    let newSlotShouldBeSelected = false;
                    for (const oldSlotString in prevSelectedSlots[day]) {
                        if (prevSelectedSlots[day][oldSlotString]) {
                            // If the old slot was indeed selected
                            const oldSlotTimes = parseSlotToMinutes(oldSlotString);
                            if (!oldSlotTimes) continue; // Couldn't parse the old slot string

                            // Case 1: Old selected slot is contained within the new slot (e.g., duration increased)
                            // Example: Old "09:00-09:30" is within New "09:00-10:00"
                            const oldContainedInNew =
                                oldSlotTimes.startMinutes >= newSlotTimes.startMinutes &&
                                oldSlotTimes.endMinutes <= newSlotTimes.endMinutes;

                            // Case 2: New slot is contained within the old selected slot (e.g., duration decreased)
                            // Example: New "09:00-09:30" is within Old "09:00-10:00"
                            const newContainedInOld =
                                newSlotTimes.startMinutes >= oldSlotTimes.startMinutes &&
                                newSlotTimes.endMinutes <= oldSlotTimes.endMinutes;

                            if (oldContainedInNew || newContainedInOld) {
                                newSlotShouldBeSelected = true;
                                break; // Found a relevant old slot, this new slot should be selected
                            }
                        }
                    }

                    if (newSlotShouldBeSelected) {
                        if (newInitializedSlots[day]) {
                            newInitializedSlots[day][newSlotString] = true;
                        }
                    }
                });
            });
            return newInitializedSlots;
        });
    }, [slotDuration]);

    if (profile?.onboarding) {
        return (
            <Card className="w-full rounded-lg shadow-md">
                <CardContent className="space-y-4 pt-6">
                    <div>
                        <SelectedSlotsSummary
                            selectedSlots={transformStudyDays(profile.onboarding.study_days)}
                        />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="w-full sm:w-auto mt-4">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Ver Horario Completo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[75vh] overflow-auto w-[90vw]">
                                <DialogHeader>
                                    <DialogTitle>Planificador de Horarios</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col lg:flex-row">
                                    <div className="flex flex-col">
                                        <SlotDurationSelector
                                            currentDuration={slotDuration}
                                            onDurationChange={handleDurationChange}
                                        />
                                        <WeeklyPlanner
                                            selectedSlots={selectedSlots}
                                            onToggleSlot={handleToggleSlot}
                                            timeSlots={currentTimeSlots}
                                        />
                                    </div>
                                    <div className="mt-6 relative">
                                        <div className="sticky top-3 p-4">
                                            <SelectedSlotsSummary selectedSlots={selectedSlots} />
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {profile.onboarding.help_with &&
                        (profile.onboarding.help_with as string[]).length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-600">Áreas de ayuda</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(profile.onboarding.help_with as string[]).map((area) => (
                                        <Badge key={area} variant={'outline'}>
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    <div>
                        <p className="text-sm font-medium text-gray-600">Objetivos</p>
                        <div className="text-sm text-gray-500">
                            {transformObjectives(profile.onboarding.objectives).map(
                                (objective, index) => (
                                    <p key={index}>- {objective}</p>
                                )
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
