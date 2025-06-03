'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/lib/supabase/queries/useProfile';

export function StudyDayNotifications() {
    const [showNotification, setShowNotification] = useState(true);
    const { toast } = useToast();
    const { data: userProfile, isLoading: isProfileLoading } = useProfile();

    useEffect(() => {
        if (!isProfileLoading && userProfile?.onboarding?.study_days && showNotification) {
            const intervalId = setInterval(() => {
                const today = new Date();
                const daysOfWeek = [
                    'Domingo',
                    'Lunes',
                    'Martes',
                    'Miércoles',
                    'Jueves',
                    'Viernes',
                    'Sábado',
                ];
                const currentDay = daysOfWeek[today.getDay()];

                const studyDaysData = userProfile.onboarding?.study_days as Record<
                    string,
                    Record<string, boolean>
                >;

                if (studyDaysData[currentDay]) {
                    const daySlots = studyDaysData[currentDay];
                    const hasActiveSlot = Object.values(daySlots).some((slot) => slot === true);

                    if (hasActiveSlot) {
                        toast({
                            title: '¡Hora de estudiar!',
                            description: `Hoy es ${currentDay} y has programado tiempo de estudio a las ${Object.keys(
                                daySlots
                            ).filter((time) => daySlots[time])}.`,
                            variant: 'default',
                        });
                        setShowNotification(false);
                    }
                }
            }, 60000); // Cambiado a 1 minuto

            return () => clearInterval(intervalId);
        }
    }, [userProfile, isProfileLoading, showNotification, toast]);

    return null;
}
