'use client';

import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
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
            <FormLabel className="text-base font-semibold">Crea tu plan de estudio base</FormLabel>
            <FormDescription>
              Basado en tu objetivo de{' '}
              <strong className="text-primary">{weeklyGoalHours} horas</strong> semanales, asigna
              tus bloques de estudio.
            </FormDescription>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 pt-4">
            {/* Left Side (Desktop) / Top (Mobile) - Planner */}
            <div className="w-full lg:w-2/3 space-y-4">
              <SlotDurationSelector
                currentDuration={slotDuration}
                onDurationChange={handleDurationChange}
              />
              <WeeklyPlanner
                selectedSlots={selectedSlots}
                onToggleSlot={handleToggleSlot}
                timeSlots={currentTimeSlots}
                compact={true}
              />
            </div>

            {/* Right Side (Desktop) / Bottom (Mobile) - Summaries */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              {/* Horas Semanales - Order 2 on Mobile, Order 1 on Desktop */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30 order-2 lg:order-1">
                <h4 className="font-semibold text-center text-primary">Horas semanales</h4>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Planificadas</span>
                  <span className="font-bold">
                    {totalSelectedHours.toFixed(1)}h / {weeklyGoalHours}h
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
                {totalSelectedHours > 0 && totalSelectedHours < weeklyGoalHours && (
                  <p className="text-sm text-muted-foreground text-center">
                    ¡Sigue así! Te faltan {(weeklyGoalHours - totalSelectedHours).toFixed(1)}h por
                    planificar.
                  </p>
                )}
                {totalSelectedHours >= weeklyGoalHours && (
                  <p className="text-sm text-green-600 font-medium text-center">
                    ¡Objetivo de planificación completado!
                  </p>
                )}
              </div>

              {/* Selected Slots - Order 1 on Mobile, Order 2 on Desktop */}
              <div className="p-4 border rounded-lg bg-muted/30 order-1 lg:order-2">
                <h4 className="font-semibold text-center mb-3 text-primary">
                  Bloques seleccionados
                </h4>
                <SelectedSlotsSummary selectedSlots={selectedSlots} />
              </div>
            </div>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
