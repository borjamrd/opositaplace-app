'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { ToastAction } from './ui/toast';

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
                            description: `Has programado tiempo de estudio. Mucho ánimo`,
                            variant: 'default',
                            duration: 10000,
                            action: (
                                <ToastAction
                                    onClick={() => {
                                        alert('Abrir modal de estudio');
                                        setShowNotification(false);
                                    }}
                                    altText="Comenzar"
                                >
                                    Comenzar
                                </ToastAction>
                            ),
                        });
                        setShowNotification(true);
                    }
                }
            }, 60000);

            return () => clearInterval(intervalId);
        }
    }, [userProfile, isProfileLoading, showNotification, toast]);

    return null;
}
