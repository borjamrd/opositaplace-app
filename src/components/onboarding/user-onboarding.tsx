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
import { useCallback, useEffect, useState, useActionState, useTransition } from 'react';

import SelectedSlotsSummary from '../weekly-planner/SelectedSlotsSummary';
import SlotDurationSelector from '../weekly-planner/SlotDurationSelector';
import WeeklyPlanner from '../weekly-planner/WeeklyPlanner';
import {
  DAYS_OF_WEEK_ORDERED,
  SLOT_DURATION_OPTIONS,
  generateTimeSlots,
} from '../weekly-planner/constants';
import { Day, SelectedSlots } from '../weekly-planner/types';
import { initializeSelectedSlots, parseSlotToMinutes } from '../weekly-planner/utils';
import { useToast } from '@/hooks/use-toast';
import { updateOnboardingInfo } from '@/actions/update-onboarding-info';

export default function UserOnboarding() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [updateState, updateAction] = useActionState(updateOnboardingInfo, {
    message: '',
    success: false,
  });

  const defaultInitialDuration = SLOT_DURATION_OPTIONS.includes(30)
    ? 30
    : SLOT_DURATION_OPTIONS[Math.floor(SLOT_DURATION_OPTIONS.length / 2)];

  // Estados para el planificador semanal
  const [slotDuration, setSlotDuration] = useState<number>(defaultInitialDuration);
  const [currentTimeSlots, setCurrentTimeSlots] = useState<string[]>(() =>
    generateTimeSlots(defaultInitialDuration)
  );
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>(() =>
    initializeSelectedSlots(generateTimeSlots(defaultInitialDuration))
  );

  // Efecto para inicializar los estados cuando el perfil carga o cambia
  // Este useEffect se encargará de "hidratar" el componente con los datos del usuario.
  useEffect(() => {
    if (profile?.onboarding) {
      const loadedDuration = profile.onboarding.slot_duration_minutes || defaultInitialDuration;

      // Asegurarse de que study_days sea un objeto válido antes de castear
      const rawStudyDaysFromProfile = profile.onboarding.study_days;
      const loadedStudyDays: SelectedSlots = {} as SelectedSlots;
      DAYS_OF_WEEK_ORDERED.forEach((day) => {
        if (
          rawStudyDaysFromProfile &&
          typeof rawStudyDaysFromProfile === 'object' &&
          !Array.isArray(rawStudyDaysFromProfile) &&
          (rawStudyDaysFromProfile as Record<string, any>)[day] !== undefined
        ) {
          loadedStudyDays[day] = (rawStudyDaysFromProfile as Record<Day, Record<string, boolean>>)[
            day
          ];
        } else {
          loadedStudyDays[day] = {};
        }
      });

      setSlotDuration(loadedDuration);
      setCurrentTimeSlots(generateTimeSlots(loadedDuration));
      setSelectedSlots(loadedStudyDays);
    } else if (!isLoading && !profile) {
      // Si no hay perfil y no está cargando, inicializar a valores por defecto
      setSlotDuration(defaultInitialDuration);
      const initialTimeSlots = generateTimeSlots(defaultInitialDuration);
      setCurrentTimeSlots(initialTimeSlots);
      setSelectedSlots(initializeSelectedSlots(initialTimeSlots));
    }
  }, [profile, isLoading, defaultInitialDuration]);

  // Efecto para actualizar los timeSlots y preservar las selecciones cuando cambia la duración del slot (solo local)
  // ESTE EFECTO NO DEBE LLAMAR A LA ACCIÓN DE SUPABASE. Solo maneja el estado local del planificador.
  useEffect(() => {
    const newTimeSlots = generateTimeSlots(slotDuration);
    setCurrentTimeSlots(newTimeSlots);

    setSelectedSlots((prevSelectedSlots) => {
      const newInitializedSlots = initializeSelectedSlots(newTimeSlots);

      DAYS_OF_WEEK_ORDERED.forEach((day) => {
        if (!prevSelectedSlots || !prevSelectedSlots[day]) return;

        newTimeSlots.forEach((newSlotString) => {
          const newSlotTimes = parseSlotToMinutes(newSlotString);
          if (!newSlotTimes) return;

          let newSlotShouldBeSelected = false;
          for (const oldSlotString in prevSelectedSlots[day]) {
            if (prevSelectedSlots[day][oldSlotString]) {
              const oldSlotTimes = parseSlotToMinutes(oldSlotString);
              if (!oldSlotTimes) continue;

              const oldContainedInNew =
                oldSlotTimes.startMinutes >= newSlotTimes.startMinutes &&
                oldSlotTimes.endMinutes <= newSlotTimes.endMinutes;

              const newContainedInOld =
                newSlotTimes.startMinutes >= oldSlotTimes.startMinutes &&
                newSlotTimes.endMinutes <= oldSlotTimes.endMinutes;

              if (oldContainedInNew || newContainedInOld) {
                newSlotShouldBeSelected = true;
                break;
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
  }, [slotDuration]); // No depende de 'form' ni de acciones de guardado

  // Efecto para manejar las respuestas de la Server Action
  useEffect(() => {
    if (updateState.message) {
      toast({
        title: updateState.success ? 'Actualización Exitosa' : 'Error al Actualizar',
        description: updateState.message,
        variant: updateState.success ? 'default' : 'destructive',
      });
      if (updateState.success) {
        refetch(); // Vuelve a cargar el perfil para asegurar la consistencia del caché (useProfile)
        setIsDialogOpen(false); // Cierra el diálogo si la actualización fue exitosa
      }
    }
  }, [updateState, toast, refetch]);

  // handleDurationChange ahora SOLO actualiza el estado LOCAL
  const handleDurationChange = useCallback((newDuration: number) => {
    setSlotDuration(newDuration);
  }, []);

  // handleToggleSlot ahora SOLO actualiza el estado LOCAL
  const handleToggleSlot = useCallback((day: Day, timeSlot: string) => {
    setSelectedSlots((prev) => {
      const currentDaySlots = prev[day] || {};
      const wasSelected = currentDaySlots[timeSlot];

      if (typeof wasSelected === 'undefined') {
        return prev;
      }

      const newDaySlots = { ...currentDaySlots };
      newDaySlots[timeSlot] = !newDaySlots[timeSlot];

      const updatedSelectedSlots = {
        ...prev,
        [day]: newDaySlots,
      };

      return updatedSelectedSlots;
    });
  }, []);

  // Función para guardar los cambios en Supabase (llamada por el botón de "Guardar")
  const handleSaveChanges = useCallback(() => {
    if (!profile?.id) {
      toast({
        title: 'Error',
        description: 'ID de usuario no disponible.',
        variant: 'destructive',
      });
      return;
    }

    // Validación simple antes de enviar
    const hasAnySlotSelected = DAYS_OF_WEEK_ORDERED.some(
      (day) =>
        selectedSlots[day] && Object.values(selectedSlots[day]).some((isSelected) => isSelected)
    );

    if (!hasAnySlotSelected) {
      toast({
        title: 'Error de validación',
        description: 'Debes seleccionar al menos una franja horaria de estudio.',
        variant: 'destructive',
      });
      return;
    }

    // Llamar a la Server Action para guardar los cambios
    startUpdateTransition(() => {
      updateAction({
        userId: profile.id,
        studyDays: selectedSlots,
        slotDurationMinutes: slotDuration,
      });
    });
  }, [profile, selectedSlots, slotDuration]);

  // Resto del código (renderizado)
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

  // Si el usuario no ha completado el onboarding, mostrar un mensaje o un botón para ir a la página de onboarding
  if (!profile?.onboarding) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Aún no has completado tu configuración de estudio inicial.
          </p>
          {/* Se asume que profile.id siempre estará disponible aquí si no hay profile.onboarding */}
          <Button onClick={() => (window.location.href = `/onboarding/${profile?.id}`)}>
            Completar Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant={'borderless'} className="w-full">
      <CardContent className="space-y-4 pt-6 border-none">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-3/5 flex flex-col">
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
          <div className="w-2/5 mt-6 relative flex flex-col gap-4">
            <SelectedSlotsSummary selectedSlots={selectedSlots} />
            <div className="flex justify-end gap-2 p-4 mb-4 pt-0 border-b">
              <Button onClick={handleSaveChanges} variant={'secondary'} disabled={isUpdating}>
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
        {profile.onboarding.help_with && (profile.onboarding.help_with as string[]).length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Áreas de ayuda</p>
            <div className="flex flex-col md:flex-row flex-wrap gap-2 mt-1">
              {(profile.onboarding.help_with as string[]).map((area) => (
                <Badge key={area} className="text-base px-3 py-1 rounded-lg" variant={'outline'}>
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Objetivos</p>
          <div className="text-sm text-muted-foreground">
            {profile.onboarding.objectives &&
              (profile.onboarding.objectives as any)?.main_challenge && (
                <p>{(profile.onboarding.objectives as any).main_challenge}</p>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
