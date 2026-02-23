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
    <div className="w-full flex items-center justify-center">
      <FormField
        control={control}
        name="weekly_study_goal_hours"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-4">
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 20"
                {...field}
                className="max-w-xs font-bold h-20 rounded-3xl md:text-4xl"
              />
            </FormControl>
            <FormDescription>
              Esto se usará para medir tu progreso en el planificador.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
