'use server';

import { createFreeSubscription, createTrialSubscription } from '@/lib/stripe/actions';
import type { TablesInsert } from '@/lib/supabase/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/email';
import AdminNotificationEmail from '@/emails/admin-notification-email';
import { OnboardingErrorEmail } from '@/emails/onboarding-error-email';
import React from 'react';
import { z } from 'zod';

const onboardingActionSchema = z.object({
  user_id: z.string().uuid({ message: 'ID de usuario inválido.' }),
  opposition_id: z
    .string()
    .uuid({ message: 'ID de oposición inválido.' })
    .min(1, 'Se requiere ID de oposición.'),
  weekly_study_goal_hours: z.string().min(1, 'El objetivo de horas es requerido.'),
  cycle_number: z.string().default('1'),
  selected_topics: z.string().default('[]'),
  selected_plan: z.enum(['free', 'trial']).default('trial'),
});

type InitialState = {
  message: string;
  errors: Record<string, string[]> | null;
  success: boolean;
};

/**
 * Silently sends error notification emails to the user and admin.
 * Never throws — email failures must never block the user-facing error response.
 */
async function notifyOnboardingError({
  userEmail,
  userName,
  errorStep,
  errorDetail,
}: {
  userEmail: string;
  userName?: string;
  errorStep: string;
  errorDetail: string;
}) {
  const adminEmail = process.env.EMAIL_TO;

  const emailPromises: Promise<unknown>[] = [
    sendEmail({
      to: userEmail,
      subject: 'Problema durante tu registro en Opositaplace',
      emailComponent: React.createElement(OnboardingErrorEmail, {
        userName: userName ?? userEmail,
        errorStep,
      }),
    }).catch((err) => console.error('[onboarding] Error sending user error email:', err)),
  ];

  if (adminEmail) {
    emailPromises.push(
      sendEmail({
        to: adminEmail,
        subject: `[Onboarding Error] ${errorStep}`,
        emailComponent: React.createElement(AdminNotificationEmail, {
          title: `Error en onboarding — ${errorStep}`,
          message: `Se produjo un error durante el onboarding de un usuario que impidió el acceso al dashboard.`,
          details: {
            Usuario: userName ?? '(desconocido)',
            Email: userEmail,
            Paso: errorStep,
            Detalle: errorDetail,
            Fecha: new Date().toISOString(),
          },
        }),
      }).catch((err) => console.error('[onboarding] Error sending admin error email:', err))
    );
  }

  await Promise.allSettled(emailPromises);
}

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
    weekly_study_goal_hours: formData.get('weekly_study_goal_hours'),
    cycle_number: formData.get('cycle_number') || '1',
    selected_topics: formData.get('selected_topics') || '[]',
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
    weekly_study_goal_hours,
    cycle_number,
    selected_topics: selectedTopicsString,
    selected_plan,
  } = validationResult.data;

  // 1. Vincular Oposición
  const { error: userOppositionsError } = await supabase.from('user_oppositions').insert({
    profile_id: user_id,
    opposition_id: opposition_id,
    enrolled_at: new Date().toISOString(),
    active: true,
  });

  if (userOppositionsError) {
    console.error('Error inserting user_oppositions:', userOppositionsError);
    if (userOppositionsError.code === '23505') {
      const { error: updateError } = await supabase
        .from('user_oppositions')
        .update({ active: true, enrolled_at: new Date().toISOString() })
        .eq('profile_id', user_id)
        .eq('opposition_id', opposition_id);

      if (updateError) {
        await notifyOnboardingError({
          userEmail: user.email!,
          userName: user.user_metadata?.full_name ?? user.email,
          errorStep: 'Reactivar oposición existente',
          errorDetail: updateError.message,
        });
        return {
          message: 'Ya estás asociado a esta oposición, pero no pudimos reactivarla.',
          errors: { opposition_id: ['Error al reactivar oposición existente.'] },
          success: false,
        };
      }
      // Continuar si la actualización fue exitosa
    } else {
      await notifyOnboardingError({
        userEmail: user.email!,
        userName: user.user_metadata?.full_name ?? user.email,
        errorStep: 'Asociar oposición',
        errorDetail: userOppositionsError.message,
      });
      return {
        message: `Error al asociar la oposición`,
        errors: null,
        success: false,
      };
    }
  }

  // let parsedHelpWith: Json;
  let parsedSelectedTopics: string[] = [];

  // 2. Guardar información de Onboarding
  const onboardingData: TablesInsert<'onboarding_info'> = {
    user_id: user_id,
    opposition_id: opposition_id,
    weekly_study_goal_hours: parseInt(weekly_study_goal_hours, 10),
  };

  // 1. Intentar crear la suscripción PRIMERO
  const currentCycleNumber = parseInt(cycle_number, 10);

  // Primero, desactivamos/cerramos ciclos anteriores si existen (opcional, pero buena práctica)
  // En onboarding se asume que empieza de cero o reinicia, pero si seleccionó vuelta 5, creamos la vuelta 5.

  // Insertamos el ciclo seleccionado
  const { data: newCycle, error: cycleError } = await supabase
    .from('user_study_cycles')
    .insert({
      user_id: user_id,
      opposition_id: opposition_id,
      cycle_number: currentCycleNumber,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (cycleError) {
    console.error('Error creating study cycle:', cycleError);
    // No bloqueamos el onboarding completo por esto, pero idealmente debería funcionar
  } else if (newCycle && parsedSelectedTopics.length > 0) {
    // 4. Marcar temas seleccionados como completados (Nuevo paso)
    // Mapeamos los topic IDs a objetos insertables
    const topicStatusInserts = parsedSelectedTopics.map((topicId) => ({
      user_id: user_id,
      study_cycle_id: newCycle.id,
      topic_id: topicId,
      status: 'completed' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: topicsError } = await supabase
      .from('user_topic_status')
      .insert(topicStatusInserts);

    if (topicsError) {
      console.error('Error inserting topic statuses:', topicsError);
    }
  }

  // 5. Suscripción
  try {
    // Comprobar si el usuario ya tiene una suscripción antes de crear una de prueba
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (!existingSubscription) {
      console.log('Creando suscripción de tipo:', selected_plan);

      if (selected_plan === 'free') {
        await createFreeSubscription(user);
      } else {
        await createTrialSubscription(user);
      }
    } else {
      console.log('El usuario ya tiene suscripción, omitiendo creación.');
    }
  } catch (subError: any) {
    console.error('Error creando la suscripción:', subError);

    await notifyOnboardingError({
      userEmail: user.email!,
      userName: user.user_metadata?.full_name ?? user.email,
      errorStep: 'Crear suscripción',
      errorDetail: subError?.message ?? String(subError),
    });
    return {
      message: 'Hubo un error al configurar tu onboarding. Por favor, inténtalo de nuevo.',
      errors: { general: ['Error con el proveedor de pagos.'] },
      success: false,
    };
  }

  const { error: onboardingInfoError } = await supabase
    .from('onboarding_info')
    .upsert(onboardingData, { onConflict: 'user_id' });

  if (onboardingInfoError) {
    console.error('Error upserting onboarding_info:', onboardingInfoError);
    await notifyOnboardingError({
      userEmail: user.email!,
      userName: user.user_metadata?.full_name ?? user.email,
      errorStep: 'Guardar información de onboarding',
      errorDetail: onboardingInfoError.message,
    });
    return {
      message: `Error al guardar detalles del onboarding: ${onboardingInfoError.message}`,
      errors: null,
      success: false,
    };
  }

  return {
    message: 'Onboarding completado con éxito. Se te redirigirá a tu dashboard.',
    errors: null,
    success: true,
  };
}
