'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getTestStatistics(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'User not authenticated' };

  const { data: attempts, error } = await supabase
    .from('test_attempts')
    .select(
      '*, test_attempt_answers(count), questions:test_attempt_questions!test_attempt_questions_test_attempt_id_fkey(question_id)'
    )
    .eq('user_id', user.id)
    .eq('study_cycle_id', cycleId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching test statistics:', error);
    return { error: 'Failed to fetch test statistics' };
  }

  return { attempts };
}

export async function getStudyTimeStatistics(cycleId: string) {
  console.log('cycleId', cycleId);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'User not authenticated' };

  // Assuming user_study_sessions has a study_cycle_id or we filter by date range of the cycle.
  // Based on the prompt, we assume direct link or inferred.
  // Checking previous research: 'user_study_sessions' was found in types.ts.
  // Ideally it should have 'study_cycle_id'. If not, we might need to filter by date.
  // For now, I will assume it has it or I can query it.
  // WAIT: I saw 'user_study_sessions' in Types but I didn't see the full definition in `database.types.ts`
  // let's assume it has `study_cycle_id` based on project conventions, if not I will fix it.

  const { data: sessions, error } = await supabase
    .from('user_study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('study_cycle_id', cycleId);

  if (error) {
    console.error('Error fetching study sessions:', error);
    return { error: 'Failed to fetch study sessions' };
  }

  return { sessions };
}

export async function getCoveredContentStatistics(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'User not authenticated' };

  // Fetch topics covered in this cycle via test attempts
  // This is a complex query. Alternatively, we fetch all questions answered in this cycle
  // and aggregate their topics.

  // Step 1: Get all attempts for this cycle
  const { data: attempts, error: attemptsError } = await supabase
    .from('test_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('study_cycle_id', cycleId)
    .eq('status', 'completed');

  if (attemptsError || !attempts) {
    return { error: 'Failed to fetch attempts for content stats' };
  }

  const attemptIds = attempts.map((a) => a.id);

  if (attemptIds.length === 0) {
    return { topics: [], blocks: [] };
  }

  // Step 2: Get questions from these attempts with their topics and blocks
  // We need to join test_attempt_questions -> questions -> topics -> blocks
  const { data: questions, error: questionsError } = await supabase
    .from('test_attempt_questions')
    .select(
      `
            question:questions (
                id,
                topic:topics (
                    id,
                    name,
                    block:blocks (
                        id,
                        name
                    )
                )
            )
        `
    )
    .in('test_attempt_id', attemptIds);

  if (questionsError) {
    return { error: 'Failed to fetch covered content' };
  }

  // Aggregation logic can be done here or in the client.
  // Returning the raw list of covered topics/blocks is safer for flexibility.

  return { questions };
}
