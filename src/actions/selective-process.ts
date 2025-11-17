'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { FullUserProcess, UserProcessStatus } from '@/lib/supabase/types';

type UpdateTrackingStatusResult = {
  data?: UserProcessStatus;
  error?: string;
};

/**
 * Obtiene el proceso selectivo completo para un usuario basado en su oposición activa.
 * Devuelve el proceso, todas sus etapas ordenadas y el estado de seguimiento del usuario.
 * @param oppositionId El ID de la oposición activa del usuario.
 * @returns Un objeto FullUserProcess o null si no se encuentra un proceso para esa oposición.
 */
export async function getUserSelectiveProcess(
  oppositionId: string
): Promise<FullUserProcess | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error('Usuario no autenticado.');
    return null;
  }

  // 1. Encontrar el proceso selectivo más reciente para la oposición dada
  const { data: process, error: processError } = await supabase
    .from('selective_processes')
    .select('*')
    .eq('opposition_id', oppositionId)
    .order('year', { ascending: false })
    .limit(1)
    .single();

  if (processError || !process) {
    console.log('No se encontró un proceso selectivo para esta oposición:', oppositionId);
    return null;
  }

  // 2. Obtener todas las etapas de ese proceso, ordenadas
  const { data: stages, error: stagesError } = await supabase
    .from('process_stages')
    .select('*')
    .eq('process_id', process.id)
    .order('stage_order', { ascending: true });

  if (stagesError) {
    console.error('Error al obtener las etapas del proceso:', stagesError.message);
    return null;
  }

  // 3. Obtener el estado de seguimiento específico de este usuario para este proceso
  const { data: userStatus, error: userStatusError } = await supabase
    .from('user_process_status')
    .select('*')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .single();

  if (userStatusError && userStatusError.code !== 'PGRST116') {
    // PGRST116 es el código para "no rows found", lo cual es un caso válido.
    // Cualquier otro error sí es un problema.
    console.error('Error al obtener el estado del usuario:', userStatusError.message);
  }

  return {
    process,
    stages: stages || [],
    userStatus: userStatus || null,
  };
}

/**
 * Crea o actualiza el estado de seguimiento de un usuario para un proceso selectivo.
 * @param processId El ID del proceso que el usuario va a seguir/actualizar.
 * @param trackingStatus El nuevo estado ('TRACKING' o 'PREPARING').
 * @returns El registro actualizado de user_process_status.
 */
export async function updateUserTrackingStatus(
  processId: string,
  trackingStatus: 'TRACKING' | 'PREPARING'
): Promise<UpdateTrackingStatusResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Usuario no autenticado.' };
  }

  // Usamos upsert: crea la fila si no existe, o la actualiza si ya existe (basado en la restricción UNIQUE de user_id y process_id)
  const { data, error } = await supabase
    .from('user_process_status')
    .upsert({
      user_id: user.id,
      process_id: processId,
      tracking_status: trackingStatus,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar el estado de seguimiento:', error.message);
    return { error: 'No se pudo actualizar tu estado en el proceso.' };
  }

  return { data };
}

/**
 * Actualiza la etapa actual de un usuario en un proceso selectivo.
 * @param processId El ID del proceso que se está actualizando.
 * @param newStageId El ID de la nueva etapa actual del usuario.
 * @returns El registro actualizado de user_process_status.
 */
export async function updateUserCurrentStage(
  processId: string,
  newStageId: string
): Promise<UpdateTrackingStatusResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Usuario no autenticado.' };
  }

  const { data, error } = await supabase
    .from('user_process_status')
    .update({ current_stage_id: newStageId })
    .eq('user_id', user.id)
    .eq('process_id', processId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar la etapa actual:', error.message);
    return { error: 'No se pudo actualizar tu progreso.' };
  }

  return { data };
}
