// src/actions/practical-cases.ts
'use server';

import { inngest } from '@/inngest/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getPracticalCases(oppositionId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('practical_cases')
    .select('id, title, difficulty')
    .eq('opposition_id', oppositionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
  return data;
}

export async function checkPracticalCaseAccess(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status, price_id')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  const isPro =
    subscription?.price_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID ||
    subscription?.price_id === 'price_premium_placeholder';

  return isPro;
}

export async function getPracticalCaseWithAttempt(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Check premium access
  const isAllowed = await checkPracticalCaseAccess(user.id);
  if (!isAllowed) {
    return { error: 'Requires Premium Subscription' };
  }

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

  try {
    // 1. Crear el job en base de datos
    const { data: job, error: jobError } = await supabase
      .from('practical_case_correction_jobs')
      .insert({
        user_id: user.id,
        case_id: caseId,
        user_answer: userAnswer,
        status: 'pending',
      })
      .select()
      .single();

    if (jobError) throw new Error(jobError.message);

    // 2. Enviar evento a Inngest
    await inngest.send({
      name: 'practical-case/correct',
      data: {
        caseId,
        userId: user.id,
        userAnswer,
        jobId: job.id,
      },
    });

    return { success: true, jobId: job.id, status: 'pending' };
  } catch (error: any) {
    console.error('Error iniciando corrección:', error);
    return { error: 'Hubo un problema al iniciar la corrección. Inténtalo de nuevo.' };
  }
}

export async function getCorrectionJobStatus(jobId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('practical_case_correction_jobs')
    .select('status, result, error_message')
    .eq('id', jobId)
    .single();

  if (error) return { error: error.message };
  return { status: data.status, result: data.result, errorMessage: data.error_message };
}
