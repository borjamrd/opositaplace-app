'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import SelectedSlotsSummary from '@/components/weekly-planner/SelectedSlotsSummary';
import SlotDurationSelector from '@/components/weekly-planner/SlotDurationSelector';
import WeeklyPlanner from '@/components/weekly-planner/WeeklyPlanner';
import { Day, SelectedSlots } from '@/components/weekly-planner/types';
import { useFormContext } from 'react-hook-form';

interface OnboardingPlanStepProps {
  weeklyGoalHours: number;
  totalSelectedHours: number;
  progressPercentage: number;
  selectedSlots: SelectedSlots;
  isPlannerOpen: boolean;
  setIsPlannerOpen: (isOpen: boolean) => void;
  slotDuration: number;
  handleDurationChange: (duration: number) => void;
  currentTimeSlots: string[];
  handleToggleSlot: (day: Day, timeSlot: string) => void;
}

export default function OnboardingPlanStep({
  weeklyGoalHours,
  totalSelectedHours,
  progressPercentage,
  selectedSlots,
  isPlannerOpen,
  setIsPlannerOpen,
  slotDuration,
  handleDurationChange,
  currentTimeSlots,
  handleToggleSlot,
}: OnboardingPlanStepProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="study_days"
      render={() => (
        <FormItem className="space-y-6">
          <div className="space-y-2">
            <FormLabel className="text-base font-semibold">
              Crea tu plan de estudio base
            </FormLabel>
            <FormDescription>
              Basado en tu objetivo de{' '}
              <strong className="text-primary">{weeklyGoalHours} horas</strong>,
              asigna tus bloques de estudio.
            </FormDescription>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-primary">Horas Planificadas</span>
              <span>
                {totalSelectedHours.toFixed(1)}h / {weeklyGoalHours}h
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            {totalSelectedHours > 0 && totalSelectedHours < weeklyGoalHours && (
              <p className="text-sm text-muted-foreground text-center">
                ¡Sigue así! Te faltan{' '}
                {(weeklyGoalHours - totalSelectedHours).toFixed(1)} horas por
                planificar.
              </p>
            )}
            {totalSelectedHours >= weeklyGoalHours && (
              <p className="text-sm text-green-600 font-medium text-center">
                ¡Objetivo de planificación completado!
              </p>
            )}
          </div>

          <SelectedSlotsSummary selectedSlots={selectedSlots} />

          <Dialog open={isPlannerOpen} onOpenChange={setIsPlannerOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Abrir planificador semanal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[85vh] overflow-auto w-[90vw]">
              <DialogHeader>
                <DialogTitle>Planificador de Horarios</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-grow">
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
                <div className="lg:w-1/3 relative">
                  <div className="sticky top-0 p-4 space-y-4">
                    <h4 className="font-semibold">Resumen de Horas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary">Planificadas</span>
                        <span>
                          {totalSelectedHours.toFixed(1)}h / {weeklyGoalHours}h
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="w-full" />
                    </div>
                    <SelectedSlotsSummary selectedSlots={selectedSlots} />
                    <Button
                      type="button"
                      onClick={() => setIsPlannerOpen(false)}
                      className="w-full"
                    >
                      Cerrar Planificador
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}