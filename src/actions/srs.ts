'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Json } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

// Tipo para la autoevaluación del usuario
type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Crea una nueva tarjeta de repaso, normalmente desde una pregunta fallada.
 */
export async function createReviewCard(data: {
  frontContent: Json;
  backContent: Json;
  sourceQuestionId?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('User not authenticated');

  const { error } = await supabase.from('srs_cards').insert({
    user_id: authData.user.id,
    front_content: data.frontContent,
    back_content: data.backContent,
    source_question_id: data.sourceQuestionId,
    next_review_at: new Date().toISOString(),
    current_interval: 1,
    ease_factor: DEFAULT_EASE_FACTOR,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
}

/**
 * Procesa la revisión de una tarjeta y calcula su próximo repaso.
 */
export async function processCardReview(cardId: string, rating: ReviewRating) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('User not authenticated');

  // 1. Obtener el estado actual de la tarjeta
  const { data: card, error: fetchError } = await supabase
    .from('srs_cards')
    .select('current_interval, ease_factor')
    .eq('id', cardId)
    .eq('user_id', authData.user.id)
    .single();

  if (fetchError || !card) throw new Error('Card not found');

  let newInterval: number;
  let newEaseFactor = card.ease_factor;

  // 2. Calcular nuevo intervalo y factor de facilidad
  switch (rating) {
    case 'again':
      newInterval = 1; // Reiniciar el intervalo a 1 día
      newEaseFactor = Math.max(card.ease_factor - 0.2, MIN_EASE_FACTOR);
      break;
    case 'hard':
      newInterval = Math.round(card.current_interval * 1.2);
      newEaseFactor = Math.max(card.ease_factor - 0.15, MIN_EASE_FACTOR);
      break;
    case 'good':
      newInterval = Math.round(card.current_interval * card.ease_factor);
      break;
    case 'easy':
    default:
      newInterval = Math.round(card.current_interval * card.ease_factor * 1.3);
      newEaseFactor = card.ease_factor + 0.15;
      break;
  }

  // Evitar que 'hard' y 'good' se queden en el mismo intervalo
  if (rating !== 'again' && newInterval === card.current_interval) {
    newInterval += 1;
  }

  // 3. Calcular la nueva fecha de repaso
  const newReviewDate = new Date();
  newReviewDate.setDate(newReviewDate.getDate() + newInterval);

  // 4. Actualizar la tarjeta en la BD
  const { error: updateError } = await supabase
    .from('srs_cards')
    .update({
      current_interval: newInterval,
      ease_factor: newEaseFactor,
      next_review_at: newReviewDate.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', cardId);

  if (updateError) throw new Error(updateError.message);
}

/**
 * Obtiene las tarjetas que el usuario debe repasar HOY.
 */
export async function getDueReviewCards() {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return [];

  const { data: cards, error } = await supabase
    .from('srs_cards')
    .select('*')
    .eq('user_id', authData.user.id)
    .lte('next_review_at', new Date().toISOString()) // ¡Esta es la consulta clave!
    .order('last_reviewed_at', { ascending: true }) // Repasar las más antiguas primero
    .limit(20); // Limitar la sesión para no abrumar

  if (error) {
    console.error('Error fetching due cards:', error);
    return [];
  }
  return cards;
}
