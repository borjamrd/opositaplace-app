// src/actions/update-onboarding-info.ts
"use server";

import type { Json, TablesUpdate } from "@/lib/database.types";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { SelectedSlots, Day } from '@/components/weekly-planner/types'; // Importar tipos necesarios

// Define un esquema Zod para la carga útil de la actualización
const updateOnboardingSchema = z.object({
  userId: z.string().uuid({ message: "ID de usuario inválido." }),
  studyDays: z.record(
    z.nativeEnum(Day),
    z.record(z.string(), z.boolean())
  ).refine(
    (data) => Object.values(data).some(daySlots =>
      Object.values(daySlots).some(isSelected => isSelected)
    ),
    {
      message: "Debes seleccionar al menos una franja horaria de estudio.",
      path: ["studyDays"],
    }
  ),
  slotDurationMinutes: z.coerce
    .number({
      invalid_type_error: "La duración debe ser un número entero.",
    })
    .int("La duración debe ser un número entero.")
    .positive("La duración debe ser un número positivo."),
});

type UpdateOnboardingState = {
  message: string;
  errors?: Record<string, string[]>; // Opcional, si quieres errores por campo
  success: boolean;
};

export async function updateOnboardingInfo(
  prevState: UpdateOnboardingState, // El estado anterior de useActionState (no usado aquí, pero requerido por la firma)
  payload: { userId: string; studyDays: SelectedSlots; slotDurationMinutes: number }
): Promise<UpdateOnboardingState> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== payload.userId) {
    return {
      message: "Usuario no autorizado para actualizar esta información.",
      success: false,
    };
  }

  // Validar la carga útil con Zod
  const validationResult = updateOnboardingSchema.safeParse(payload);

  if (!validationResult.success) {
    console.error("Update validation errors:", validationResult.error.flatten().fieldErrors);
    return {
      message: "Error de validación al actualizar las preferencias.",
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { userId, studyDays, slotDurationMinutes } = validationResult.data;

  // Preparar los datos para la actualización
  const updateData: TablesUpdate<'onboarding_info'> = {
    study_days: studyDays as Json, // Castear a Json ya que Supabase espera ese tipo
    slot_duration_minutes: slotDurationMinutes,
    // Aquí podrías añadir otros campos si este action fuera a actualizar más cosas del onboarding
  };

  // Realizar la actualización en la base de datos
  const { data, error } = await supabase
    .from('onboarding_info')
    .update(updateData) // Usamos 'update' para un registro existente
    .eq('user_id', userId) // Asegurarse de que solo se actualice el registro del usuario actual
    .select() // Opcional: seleccionar la fila actualizada para confirmar el éxito
    .single(); // Esperamos que haya un solo registro por usuario

  if (error) {
    console.error("Error al actualizar la información de onboarding:", error);
    return {
      message: `Error al actualizar las preferencias: ${error.message}`,
      success: false,
    };
  }

  return {
    message: "Preferencias de estudio actualizadas correctamente.",
    success: true,
  };
}