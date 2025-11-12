'use client';

import { Badge } from '@/components/ui/badge';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';

const helpOptions = [
    'Organización del estudio',
    'Técnicas de memorización',
    'Gestión del tiempo',
    'Realización de tests',
    'Manejo del estrés y ansiedad',
    'Planificación de repasos',
    'Toma de apuntes y síntesis',
    'Lectura rápida y comprensión',
] as const;

export default function OnboardingEvaluationStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-20">
      <FormField
        control={control}
        name="help_with"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base font-semibold mb-4">
              ¿En qué áreas podríamos ayudarte más?
            </FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2 pt-2">
                {helpOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={field.value?.includes(option) ? 'default' : 'outline'}
                    className="cursor-pointer select-none text-base px-3 py-1 rounded-lg"
                    onClick={() => {
                      const currentValue = field.value || [];
                      if (currentValue.includes(option)) {
                        field.onChange(currentValue.filter((item: string) => item !== option));
                      } else {
                        field.onChange([...currentValue, option]);
                      }
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </FormControl>
            <FormDescription>Selecciona una o varias opciones.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="baseline_assessment"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base font-semibold mb-4">
              ¿Qué es lo que más te cuesta o qué necesitas a la hora de estudiar?
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ejemplo: Me cuesta mantener la constancia, me distraigo con facilidad y no sé cómo organizar los repasos..."
                {...field}
                rows={5}
              />
            </FormControl>
            <FormDescription>
              Esto nos ayudará a personalizar tu plan (máx. 500 caracteres).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
