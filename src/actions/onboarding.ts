"use server";

import type { Json, TablesInsert } from "@/lib/database.types";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// Esquema Zod para la validación de los datos recibidos por la acción desde FormData
const onboardingActionSchema = z.object({
  user_id: z.string().uuid({ message: "ID de usuario inválido." }),
  available_hours: z.coerce
    .number({ required_error: 'Las horas disponibles son requeridas.', invalid_type_error: "Las horas disponibles deben ser un número." })
    .positive({ message: "Las horas disponibles deben ser un número positivo."})
    .min(1, "Debes indicar al menos 1 hora disponible.")
    .max(168, "El número de horas parece excesivo."),
  objectives: z.string().min(1, "Los objetivos no pueden estar vacíos como JSON string."), // JSON string
  study_days: z.string().min(1, "Los días de estudio no pueden estar vacíos como JSON string."), // JSON string
  help_with: z.string().optional().default("[]"), // Nuevo campo, vendrá como JSON string de un array
  opposition_id: z.string().uuid({ message: "ID de oposición inválido." }).nullable().optional(),
});

type InitialState = {
  message: string;
  errors: Record<string, string[]> | null;
  success: boolean;
};

export async function submitOnboarding(
  prevState: InitialState,
  formData: FormData
): Promise<InitialState> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const rawFormData = {
    user_id: formData.get('user_id'),
    available_hours: formData.get('available_hours'),
    objectives: formData.get('objectives'),
    study_days: formData.get('study_days'),
    help_with: formData.get('help_with') || "[]", // Default to empty array string if not present
    opposition_id: formData.get('opposition_id') || null,
  };

  const validationResult = onboardingActionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Action Validation errors:", validationResult.error.flatten().fieldErrors);
    return {
      message: "Error de validación. Revisa los campos.",
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { 
    user_id, 
    available_hours, 
    objectives: objectivesString, 
    study_days: studyDaysString, 
    help_with: helpWithString,
    opposition_id 
  } = validationResult.data;

  let parsedObjectives: Json;
  let parsedStudyDays: Json;
  let parsedHelpWith: Json;

  try {
    parsedObjectives = JSON.parse(objectivesString);
  } catch (e) {
    return { message: 'Error al procesar los objetivos.', errors: { objectives: ['Formato JSON inválido para objetivos.'] }, success: false };
  }

  try {
    parsedStudyDays = JSON.parse(studyDaysString);
    if (Object.keys(parsedStudyDays as object).length === 0) {
        return { message: 'Debes seleccionar al menos un día de estudio.', errors: { study_days: ['Selecciona al menos un día.'] }, success: false };
    }
  } catch (e) {
    return { message: 'Error al procesar los días de estudio.', errors: { study_days: ['Formato JSON inválido para días de estudio.'] }, success: false };
  }

  try {
    parsedHelpWith = JSON.parse(helpWithString);
    if (!Array.isArray(parsedHelpWith)) {
     
    }
  } catch (e) {
    return { message: 'Error al procesar las áreas de ayuda.', errors: { help_with: ['Formato JSON inválido para áreas de ayuda.'] }, success: false };
  }


  const onboardingData: TablesInsert<'onboarding_info'> = {
    user_id,
    available_hours,
    objectives: parsedObjectives,
    study_days: parsedStudyDays,
    help_with: parsedHelpWith,
    opposition_id: opposition_id || null,
  };

  const { error } = await supabase.from('onboarding_info').insert(onboardingData);

  if (error) {
    console.error("Error inserting onboarding info:", error);
    if (error.code === '23505') { 
        return { message: 'Ya has completado el onboarding anteriormente.', errors: null, success: false };
    }
    return {
      message: error.message || "Error al guardar la información. Inténtalo de nuevo.",
      errors: null,
      success: false,
    };
  }

  redirect("/dashboard?onboarding_status=completed_with_help"); 
}