'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SyllabusStatus } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene el ciclo de estudio activo del usuario para su oposición activa.
 */
async function getActiveStudyCycle() {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('User not authenticated');

  // 1. Encontrar la oposición activa del usuario
  const { data: activeOppo, error: oppoError } = await supabase
    .from('user_oppositions')
    .select('opposition_id')
    .eq('profile_id', authData.user.id)
    .eq('active', true)
    .single();

  if (oppoError || !activeOppo || !activeOppo.opposition_id) {
    throw new Error('No active opposition found');
  }
  const oppositionId = activeOppo.opposition_id;

  // 2. Encontrar el ciclo de estudio activo (no completado) para esa oposición
  const { data: activeCycle, error: cycleError } = await supabase
    .from('user_study_cycles')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('opposition_id', oppositionId)
    .is('completed_at', null)
    .order('cycle_number', { ascending: false })
    .limit(1)
    .single();

  if (cycleError || !activeCycle) {
    throw new Error('No active study cycle found');
  }

  return activeCycle;
}

/**
 * Obtiene todos los datos necesarios para renderizar el Roadmap de React Flow.
 */
export async function getRoadmapData() {
  const supabase = await createSupabaseServerClient();
  const activeCycle = await getActiveStudyCycle();

  if (!activeCycle.opposition_id || !activeCycle.user_id) {
    throw new Error('El ciclo de estudio activo no tiene oposición asociada.');
  }

  const oppositionId = activeCycle.opposition_id;

  // 1. Obtener Bloques y Temas
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('opposition_id', oppositionId)
    .order('position', { ascending: true });

  if (blocksError) {
    throw new Error('Fallo al cargar los bloques.');
  }
  if (!blocks || blocks.length === 0) {
    return {
      blocks: [],
      topics: [],
      topicStatusMap: {},
      activeCycle: activeCycle,
    };
  }
  const blockIds = blocks.map((block) => block.id);

  // 3. Obtener Temas filtrando por 'block_id'
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .in('block_id', blockIds)
    .order('position', { ascending: true });

  if (topicsError) {
    throw new Error('Fallo al cargar los temas.');
  }
  // 4. Obtener Estados
  const { data: statuses, error: statusesError } = await supabase
    .from('user_topic_status')
    .select('topic_id, status')
    .eq('study_cycle_id', activeCycle.id)
    .eq('user_id', activeCycle.user_id);

  if (topicsError || statusesError) {
    throw new Error('Fallo al cargar los temas o sus estados.');
  }

  // 5. Mapear estados
  const topicStatusMap = statuses.reduce(
    (acc, item) => {
      acc[item.topic_id] = item.status;
      return acc;
    },
    {} as Record<string, SyllabusStatus>
  );

  return {
    blocks: blocks || [],
    topics: topics || [],
    topicStatusMap: topicStatusMap,
    activeCycle: activeCycle,
  };
}

/**
 * Actualiza el estado de un tema (not_started, in_progress, completed).
 * Si se completa el último tema, dispara la creación de un nuevo ciclo.
 */
export async function updateTopicStatus(topicId: string, newStatus: SyllabusStatus) {
  const supabase = await createSupabaseServerClient();
  const activeCycle = await getActiveStudyCycle();

  if (!activeCycle || !activeCycle.user_id) {
    throw new Error('No active study cycle found');
  }
  if (!activeCycle.opposition_id) {
    throw new Error('Active study cycle has no opposition associated');
  }

  // 1. Actualizar (o insertar) el estado del tema
  const { error: upsertError } = await supabase
    .from('user_topic_status')
    .upsert({
      user_id: activeCycle.user_id,
      topic_id: topicId,
      study_cycle_id: activeCycle.id,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('study_cycle_id', activeCycle.id)
    .eq('topic_id', topicId);

  if (upsertError) {
    throw new Error(`Failed to update status: ${upsertError.message}`);
  }

  let newCycleStarted = false;

  // 2. Lógica del TRIGGER: Si el nuevo estado es 'completed', comprobar si hemos terminado
  if (newStatus === 'completed') {
    // 1. Obtenemos los IDs de los bloques de la oposición
    const { data: blocksForOppo, error: blocksError } = await supabase
      .from('blocks')
      .select('id')
      .eq('opposition_id', activeCycle.opposition_id);

    if (blocksError || !blocksForOppo) {
      throw new Error('Could not find blocks for opposition to count topics');
    }
    const blockIds = blocksForOppo.map((b) => b.id);

    // 2. Contamos los temas que pertenecen a esos bloques
    const { count: totalTopics, error: totalError } = await supabase
      .from('topics')
      .select('id', { count: 'exact' })
      .in('block_id', blockIds);

    const { count: completedTopics, error: completedError } = await supabase
      .from('user_topic_status')
      .select('topic_id', { count: 'exact' })
      .eq('study_cycle_id', activeCycle.id)
      .eq('status', 'completed');

    if (totalError || completedError) {
      throw new Error('Could not verify study cycle completion');
    }

    // 3. ¡COMPLETADO!
    if (totalTopics === completedTopics) {
      await supabase
        .from('user_study_cycles')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', activeCycle.id);

      // Crear nuevo ciclo (Vuelta + 1)
      await supabase.from('user_study_cycles').insert({
        user_id: activeCycle.user_id,
        opposition_id: activeCycle.opposition_id,
        cycle_number: activeCycle.cycle_number + 1,
        started_at: new Date().toISOString(),
      });
      newCycleStarted = true;
    }
  }

  revalidatePath('/dashboard/roadmap');
  return { status: newStatus, newCycleStarted, error: null };
}
