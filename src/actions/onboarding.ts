'use server';

import type { Json, TablesInsert } from '@/lib/supabase/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createTrialSubscription } from '@/lib/stripe/actions';

const onboardingActionSchema = z.object({
  user_id: z.string().uuid({ message: 'ID de usuario inválido.' }),
  opposition_id: z
    .string()
    .uuid({ message: 'ID de oposición inválido.' })
    .min(1, 'Se requiere ID de oposición.'),

  objectives: z.string().min(1, 'Los objetivos no pueden estar vacíos como JSON string.'),
  study_days: z.string().min(1, 'Los días de estudio no pueden estar vacíos como JSON string.'),
  help_with: z.string().optional().default('[]'),
  slot_duration_minutes: z.string().default('60'),
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

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      message: 'Usuario no autenticado. No se puede procesar el onboarding.',
      errors: null,
      success: false,
    };
  }
  const formUserId = formData.get('user_id');
  if (formUserId !== user.id) {
    console.warn(
      `Discrepancia de User ID en submitOnboarding: formUserId=${formUserId}, sessionUserId=${user.id}`
    );
    return {
      message: 'Error de consistencia de datos de usuario.',
      errors: {
        user_id: ['El ID de usuario del formulario no coincide con la sesión.'],
      },
      success: false,
    };
  }

  const rawFormData = {
    user_id: user.id,
    opposition_id: formData.get('opposition_id'),
    objectives: formData.get('objectives'),
    study_days: formData.get('study_days'),
    help_with: formData.get('help_with') || '[]',
    slot_duration_minutes: formData.get('slot_duration_minutes') || '60',
  };

  const validationResult = onboardingActionSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error('Action Validation errors:', validationResult.error.flatten().fieldErrors);
    return {
      message: 'Error de validación. Revisa los campos.',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const {
    user_id,
    opposition_id,
    objectives: objectivesString,
    study_days: studyDaysString,
    help_with: helpWithString,
    slot_duration_minutes,
  } = validationResult.data;

  const { error: userOppositionsError } = await supabase.from('user_oppositions').insert({
    profile_id: user_id,
    opposition_id: opposition_id,
    enrolled_at: new Date().toISOString(),
    active: true,
  });

  if (userOppositionsError) {
    console.error('Error inserting user_oppositions:', userOppositionsError);
    if (userOppositionsError.code === '23505') {
      return {
        message: 'Ya estás suscrito a esta oposición. Si es un error, contacta a soporte.',
        errors: { opposition_id: ['Ya estás asociado a esta oposición.'] },
        success: false,
      };
    }

    return {
      message: `Error al asociar la oposición`,
      errors: null,
      success: false,
    };
  }

  let parsedObjectives: Json;
  let parsedStudyDays: Json;
  let parsedHelpWith: Json;

  try {
    parsedObjectives = JSON.parse(objectivesString);
    parsedStudyDays = JSON.parse(studyDaysString);
    parsedHelpWith = JSON.parse(helpWithString);

    if (Object.keys(parsedStudyDays as object).length === 0) {
      return {
        message: 'Debes seleccionar al menos un día de estudio.',
        errors: { study_days: ['Selecciona al menos un día.'] },
        success: false,
      };
    }
  } catch (e: any) {
    console.error('Error parsing JSON in action:', e);
    return {
      message: `Error al procesar datos del formulario: ${e.message}`,
      errors: { general: ['Error interno procesando datos.'] },
      success: false,
    };
  }

  const onboardingData: TablesInsert<'onboarding_info'> = {
    user_id: user_id,
    objectives: parsedObjectives,
    study_days: parsedStudyDays,
    help_with: parsedHelpWith,
    opposition_id: opposition_id,
    slot_duration_minutes: parseInt(slot_duration_minutes, 10),
  };

  const { error: onboardingInfoError } = await supabase
    .from('onboarding_info')
    .insert(onboardingData);

  if (onboardingInfoError) {
    console.error('Error inserting onboarding_info:', onboardingInfoError);
    if (onboardingInfoError.code === '23505') {
      return {
        message: 'Ya has completado el onboarding (info principal).',
        errors: null,
        success: false,
      };
    }
    return {
      message: `Error al guardar detalles del onboarding: ${onboardingInfoError.message}`,
      errors: null,
      success: false,
    };
  }

  try {
    await createTrialSubscription(user);
  } catch (trialError: any) {
    console.error('Error creando la suscripción de prueba:', trialError);
    // Aunque falle la creación de la prueba, el onboarding se ha completado,
    // así que podríamos redirigir a una página de error o a los planes.
    // Por simplicidad, devolvemos un mensaje de error.
    return {
      message: `Tu onboarding se ha guardado, pero hubo un problema al iniciar tu prueba gratuita: ${trialError.message}`,
      errors: null,
      success: false,
    };
  }

  redirect('/dashboard');
}
