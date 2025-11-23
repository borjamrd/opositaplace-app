// src/actions/practical-cases.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { correctPracticalCaseFlow } from '@/ai/flows/correction-flow';
import { revalidatePath } from 'next/cache';

export async function getPracticalCases(oppositionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('practical_cases')
    .select('id, title, difficulty, topic_id, topics(name)')
    .eq('opposition_id', oppositionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
  return data;
}

export async function getPracticalCaseWithAttempt(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: caseData, error: caseError } = await supabase
    .from('practical_cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError) return { error: 'Case not found' };

  const { data: attemptData } = await supabase
    .from('practical_case_attempts')
    .select('*')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .single();

  return { caseData, attemptData };
}

export async function saveCaseDraft(caseId: string, userAnswer: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('practical_case_attempts').upsert(
    {
      user_id: user.id,
      case_id: caseId,
      user_answer: userAnswer,
      status: 'draft',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id, case_id' }
  );

  if (error) console.error('Error saving draft:', error);
  return { success: !error };
}

export async function submitAndCorrectCase(caseId: string, userAnswer: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: caseData } = await supabase
    .from('practical_cases')
    .select('statement, official_solution, evaluation_criteria')
    .eq('id', caseId)
    .single();

  if (!caseData) return { error: 'Datos del caso no encontrados.' };

  try {
    const criteriaList = Array.isArray(caseData.evaluation_criteria)
      ? caseData.evaluation_criteria.map(String)
      : [];

    const correctionResult = await correctPracticalCaseFlow({
      statement: caseData.statement,
      official_solution: caseData.official_solution,
      user_answer: userAnswer,
      evaluation_criteria: criteriaList,
    });

    console.log('Corrección:', correctionResult);

    const { error: saveError } = await supabase.from('practical_case_attempts').upsert(
      {
        user_id: user.id,
        case_id: caseId,
        user_answer: userAnswer,
        feedback_analysis: correctionResult,
        status: 'corrected',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, case_id' }
    );

    if (saveError) throw new Error(saveError.message);

    revalidatePath(`/dashboard/practical-cases/${caseId}`);
    return { success: true, feedback: correctionResult };
  } catch (error: any) {
    console.error('Error en corrección IA:', error);
    return { error: 'Hubo un problema al generar la corrección. Inténtalo de nuevo.' };
  }
}
