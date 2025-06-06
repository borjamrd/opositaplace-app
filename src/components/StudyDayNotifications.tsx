'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/lib/supabase/queries/useProfile';
import { ToastAction } from './ui/toast';

const dayNameToIndex: Record<string, number> = {
    'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
    'Jueves': 4, 'Viernes': 5, 'Sábado': 6,
};
const MINUTES_IN_WEEK = 7 * 24 * 60;

export function StudyDayNotifications() {
    const { toast } = useToast();
    const { data: userProfile, isLoading: isProfileLoading } = useProfile();
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (isProfileLoading || !userProfile?.onboarding?.study_days) {
            return;
        }

        // --- 1. PROCESAR TODOS LOS SLOTS Y ENCONTRAR LOS INICIOS DE BLOQUE ---
        const studyDaysData = userProfile.onboarding.study_days as Record<string, Record<string, boolean>>;
        
        // Un set para búsquedas ultra-rápidas de cualquier slot activo
        const activeSlotsSet = new Set<number>();
        let minGranularity = Infinity;
        const allSlotsInMinutes: number[] = [];

        Object.entries(studyDaysData).forEach(([dayName, timeSlots]) => {
            const dayIndex = dayNameToIndex[dayName];
            Object.entries(timeSlots).forEach(([time, isActive]) => {
                if (isActive) {
                    const [hour, minute] = time.split(':').map(Number);
                    const totalMinutes = dayIndex * 24 * 60 + hour * 60 + minute;
                    activeSlotsSet.add(totalMinutes);
                    allSlotsInMinutes.push(totalMinutes);
                }
            });
        });
        
        // Si no hay slots, no hacemos nada
        if (allSlotsInMinutes.length === 0) return;

        // Detectar la granularidad (ej: 15, 30 min)
        allSlotsInMinutes.sort((a, b) => a - b);
        for (let i = 1; i < allSlotsInMinutes.length; i++) {
            const diff = allSlotsInMinutes[i] - allSlotsInMinutes[i-1];
            if (diff > 0 && diff < minGranularity) {
                minGranularity = diff;
            }
        }
        // Si solo hay un slot, asumimos una granularidad de 15 min por defecto
        if (minGranularity === Infinity) minGranularity = 15;

        // Identificamos solo los slots que son "inicio de un bloque"
        const startOfBlockSlots = allSlotsInMinutes.filter(slot => {
            const previousSlot = slot - minGranularity;
            // Un slot es un inicio si NO existe un slot activo justo antes.
            // Maneja el caso de la medianoche del domingo.
            return !activeSlotsSet.has((previousSlot + MINUTES_IN_WEEK) % MINUTES_IN_WEEK);
        });


        // --- 2. FUNCIÓN PARA AGENDAR LA PRÓXIMA NOTIFICACIÓN ---
        const scheduleNextNotification = () => {
            const now = new Date();
            const nowInMinutes = now.getDay() * 24 * 60 + now.getHours() * 60 + now.getMinutes();
            let nextNotificationTime: Date | null = null;
            
            // Buscamos el próximo inicio de bloque en el futuro
            // Primero en lo que queda de esta semana...
            let nextSlot = startOfBlockSlots.find(slot => slot > nowInMinutes);
            
            // Si no, en la semana que viene
            if (!nextSlot) {
                nextSlot = startOfBlockSlots[0]; // El primero de la lista
            }

            if (typeof nextSlot !== 'undefined') {
                const dayIndex = Math.floor(nextSlot / (24 * 60));
                const minutesInDay = nextSlot % (24 * 60);
                const hour = Math.floor(minutesInDay / 60);
                const minute = minutesInDay % 60;

                const notificationDate = new Date();
                const dayDiff = dayIndex - notificationDate.getDay();
                
                // Si el día ya pasó esta semana, agendamos para la semana que viene
                if (dayDiff < 0 || (dayDiff === 0 && nextSlot <= nowInMinutes)) {
                    notificationDate.setDate(notificationDate.getDate() + (dayDiff + 7));
                } else {
                    notificationDate.setDate(notificationDate.getDate() + dayDiff);
                }
                notificationDate.setHours(hour, minute, 0, 0);

                const delay = notificationDate.getTime() - now.getTime();

                if (delay > 0) {
                    timeoutRef.current = setTimeout(() => {
                        toast({
                            title: '¡Es hora de estudiar! 💪',
                            description: `Comienza tu bloque de estudio programado.`,
                            duration: 20000,
                            action: <ToastAction altText="Comenzar">Comenzar</ToastAction>,
                        });
                        // Agendamos la siguiente notificación después de esta
                        scheduleNextNotification();
                    }, delay);
                }
            }
        };

        // Iniciar la cadena de notificaciones
        scheduleNextNotification();

        // Limpiar el timeout al desmontar el componente
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

    }, [userProfile, isProfileLoading, toast]);

    return null;
}