'use server';

import { createFreeSubscription, createTrialSubscription } from '@/lib/stripe/actions';
import type { Json, TablesInsert } from '@/lib/supabase/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Esquema de acción actualizado para coincidir con el nuevo formulario
const onboardingActionSchema = z.object({
  user_id: z.string().uuid({ message: 'ID de usuario inválido.' }),
  opposition_id: z
    .string()
    .uuid({ message: 'ID de oposición inválido.' })
    .min(1, 'Se requiere ID de oposición.'),

  // Cambiado de 'objectives' a 'baseline_assessment'
  baseline_assessment: z
    .string()
    .min(1, 'La autoevaluación no puede estar vacía como JSON string.'),

  // Nuevo campo
  weekly_study_goal_hours: z.string().min(1, 'El objetivo de horas es requerido.'),

  study_days: z.string().min(1, 'Los días de estudio no pueden estar vacíos como JSON string.'),

  help_with: z.string().optional().default('[]'),

  slot_duration_minutes: z.string().default('60'),

  selected_plan: z.enum(['free', 'trial']).default('trial'),
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
    // Mapeo de campos nuevos/actualizados
    baseline_assessment: formData.get('baseline_assessment'), // Correcto
    weekly_study_goal_hours: formData.get('weekly_study_goal_hours'),
    study_days: formData.get('study_days'),
    help_with: formData.get('help_with') || '[]',
    slot_duration_minutes: formData.get('slot_duration_minutes') || '60',
    selected_plan: formData.get('selected_plan') || 'trial',
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
    baseline_assessment: baselineAssessmentString, // Actualizado
    weekly_study_goal_hours, // Nuevo
    study_days: studyDaysString,
    help_with: helpWithString,
    slot_duration_minutes,
    selected_plan,
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
      // Si ya existe, podríamos querer actualizar 'active' a true en lugar de fallar
      const { error: updateError } = await supabase
        .from('user_oppositions')
        .update({ active: true, enrolled_at: new Date().toISOString() })
        .eq('profile_id', user_id)
        .eq('opposition_id', opposition_id);

      if (updateError) {
        return {
          message: 'Ya estás asociado a esta oposición, pero no pudimos reactivarla.',
          errors: { opposition_id: ['Error al reactivar oposición existente.'] },
          success: false,
        };
      }
      // Continuar si la actualización fue exitosa
    } else {
      return {
        message: `Error al asociar la oposición`,
        errors: null,
        success: false,
      };
    }
  }

  let parsedBaselineAssessment: Json;
  let parsedStudyDays: Json;
  let parsedHelpWith: Json;

  try {
    parsedBaselineAssessment = JSON.parse(baselineAssessmentString); // Actualizado
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
    // Mapeo a la BBDD (asumiendo que `baseline_assessment` se guarda en `objectives`)
    objectives: parsedBaselineAssessment, // Guardamos la autoevaluación en el campo 'objectives'
    study_days: parsedStudyDays,
    help_with: parsedHelpWith,
    opposition_id: opposition_id,
    slot_duration_minutes: parseInt(slot_duration_minutes, 10),
    weekly_study_goal_hours: parseInt(weekly_study_goal_hours, 10), // Nuevo campo
  };

  // Usamos 'upsert' para que si el usuario repite el onboarding, se actualice
  const { error: onboardingInfoError } = await supabase
    .from('onboarding_info')
    .upsert(onboardingData, { onConflict: 'user_id' }); // Asume que user_id es 'unique'

  if (onboardingInfoError) {
    console.error('Error upserting onboarding_info:', onboardingInfoError);
    return {
      message: `Error al guardar detalles del onboarding: ${onboardingInfoError.message}`,
      errors: null,
      success: false,
    };
  }

  try {
    // Comprobar si el usuario ya tiene una suscripción antes de crear una de prueba
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (!existingSubscription) {
      console.log('Creando suscripción de tipo:', selected_plan);

      try {
        if (selected_plan === 'free') {
          await createFreeSubscription(user);
        } else {
          await createTrialSubscription(user);
        }
      } catch (error) {
        console.error('Error al crear la suscripción inicial:', error);
      }
    } else {
      console.log('El usuario ya tiene suscripción, omitiendo creación.');
    }
  } catch (subError: any) {
    console.error('Error creando la suscripción:', subError);
    return {
      message: 'Onboarding guardado, pero hubo un error configurando el plan.',
      errors: null,
      success: true, // Dejamos pasar al usuario aunque falle Stripe
    };
  }
  return {
    message: 'Onboarding completado con éxito. Se te redirigirá a tu dashboard.',
    errors: null,
    success: true,
  };
}
