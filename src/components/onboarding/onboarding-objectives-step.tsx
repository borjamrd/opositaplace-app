'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

export default function OnboardingObjectivesStep() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="weekly_study_goal_hours"
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-4">
          <FormLabel className="text-base font-semibold">
            ¿Cuántas horas netas de estudio quieres dedicar a la semana?
          </FormLabel>
          <FormControl>
            <Input type="number" placeholder="Ej: 20" {...field} className="max-w-xs" />
          </FormControl>
          <FormDescription>
            Esto se usará para medir tu progreso en el planificador.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
