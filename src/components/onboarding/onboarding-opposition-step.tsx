'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/lib/supabase/database.types';
import { Opposition } from '@/lib/supabase/types';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface OnboardingOppositionStepProps {
  oppositions: Opposition[];
  isLoadingOppositions: boolean;
}

// Helper para formatear los nombres de los scopes
function formatScopeName(scope: string) {
  return scope.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

type Scope = Database['public']['Enums']['opposition_scope_enum'];

export default function OnboardingOppositionStep({
  oppositions,
  isLoadingOppositions,
}: OnboardingOppositionStepProps) {
  const { control, setValue, watch } = useFormContext();
  const currentOppositionId = watch('opposition_id');
  const selectedScope = watch('opposition_scope') as Scope | null;

  // Sincroniza el scope si el usuario vuelve a este paso
  useEffect(() => {
    if (currentOppositionId && !selectedScope && oppositions.length > 0) {
      const currentOp = oppositions.find((op) => op.id === currentOppositionId);
      if (currentOp && currentOp.opposition_scope) {
        setValue('opposition_scope', currentOp.opposition_scope, {
          shouldValidate: false,
        });
      }
    }
  }, [currentOppositionId, selectedScope, oppositions, setValue]);

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. Obtener lista única de scopes SÓLO de oposiciones ACTIVAS
  const scopes = useMemo(() => {
    const scopeSet = new Set<Scope>();
    oppositions.forEach((op) => {
      // ANTES: if (op.opposition_scope)
      // AHORA:
      if (op.opposition_scope && op.active === true) {
        scopeSet.add(op.opposition_scope);
      }
    });
    return Array.from(scopeSet);
  }, [oppositions]);
  // --- FIN DE LA CORRECCIÓN ---

  // 2. Filtrar oposiciones activas por scope (Esta ya era correcta)
  const filteredOppositions = useMemo(() => {
    if (!selectedScope) {
      return [];
    }
    return oppositions.filter((op) => op.opposition_scope === selectedScope && op.active === true);
  }, [oppositions, selectedScope]);

  if (isLoadingOppositions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* --- PASO 1: Selector de Ámbito (Ahora es un FormField) --- */}
      <FormField
        control={control}
        name="opposition_scope"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base font-semibold mb-4">
              1. Selecciona el ámbito de tu oposición
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setValue('opposition_id', undefined, { shouldValidate: false });
              }}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger className="border">
                  <SelectValue placeholder="Selecciona un ámbito..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {scopes.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {formatScopeName(scope)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Esto nos ayudará a filtrar las oposiciones disponibles.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedScope && (
        <FormField
          control={control}
          name="opposition_id"
          render={({ field }) => (
            <FormItem className="space-y-3 flex flex-col">
              <FormLabel className="text-base font-semibold mb-5">
                2. ¿Cuál es tu oposición principal?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {filteredOppositions.length === 0 && (
                    <p className="text-sm text-muted-foreground p-3 border rounded-md">
                      No hay oposiciones activas disponibles para este ámbito.
                    </p>
                  )}
                  {filteredOppositions.map((op) => (
                    <FormItem
                      key={op.id}
                      className="space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <FormControl>
                        <RadioGroupItem value={op.id} id={`op-${op.id}`} />
                      </FormControl>
                      <FormLabel
                        htmlFor={`op-${op.id}`}
                        className="font-normal cursor-pointer flex-1"
                      >
                        {op.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
