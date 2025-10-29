'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { shuffle } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type TestMode = 'random' | 'errors' | 'topics';

interface CreateTestParams {
  mode: TestMode;
  numQuestions: number;
  topicIds?: string[];
  oppositionId: string;
  studyCycleId: string;
  includeNoTopic?: boolean;
}

export async function createTestAttempt(params: CreateTestParams) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'User not authenticated' };

  let candidateQuestionIds: string[] = [];
  let error: any = null;

  switch (params.mode) {
    case 'errors':
      const { data: failedQuestions, error: rpcError } = await supabase.rpc(
        'get_user_failed_questions'
      );
      if (rpcError) {
        console.error('Error fetching failed questions:', rpcError);
        return { error: 'Could not retrieve failed questions.' };
      }
      candidateQuestionIds = failedQuestions?.map((q) => q.question_id) || [];
      break;

    case 'topics':
      if (!params.topicIds || params.topicIds.length === 0) {
        return { error: 'You must select at least one topic.' };
      }
      const { data: topicQuestions, error: topicsError } = await supabase
        .from('questions')
        .select('id, topics!inner(block_id, blocks!inner(opposition_id))')
        .in('topic_id', params.topicIds)
        .eq('topics.blocks.opposition_id', params.oppositionId);

      candidateQuestionIds = topicQuestions?.map((q) => q.id) || [];
      error = topicsError;
      break;
    case 'random':
    default:
      const { data: randomQuestionsData, error: randomError } = await supabase.rpc(
        'get_questions_by_opposition',
        {
          opp_id: params.oppositionId,
          include_no_topic: params.includeNoTopic,
        }
      );

      if (randomError) {
        return { error: 'Could not retrieve questions for random mode.' };
      }
      candidateQuestionIds = randomQuestionsData?.map((question) => question.id) || [];
      break;
  }

  if (error || !candidateQuestionIds || candidateQuestionIds.length === 0) {
    return { error: 'No questions found for the selected criteria.' };
  }

  // Step 2: Validate questions in batches to avoid "URI too large" error
  const BATCH_SIZE = 200;
  let validQuestionIds: { id: string }[] = [];
  for (let i = 0; i < candidateQuestionIds.length; i += BATCH_SIZE) {
    const batch = candidateQuestionIds.slice(i, i + BATCH_SIZE);
    const { data: validQuestions, error: validationError } = await supabase
      .from('questions')
      .select('id, answers!inner(is_correct)')
      .in('id', batch)
      .eq('answers.is_correct', true);

    if (validationError) {
      console.error('Error validating questions batch:', validationError);
      return { error: 'Error validating questions.' };
    }
    if (validQuestions) {
      const uniqueValidIds = validQuestions.map((q) => ({ id: q.id }));
      validQuestionIds = [...validQuestionIds, ...uniqueValidIds];
    }
  }

  const uniqueValidQuestionIds = Array.from(new Set(validQuestionIds.map((q) => q.id))).map(
    (id) => ({ id })
  );

  if (uniqueValidQuestionIds.length === 0) {
    return { error: 'No valid questions found for the selected criteria.' };
  }

  // Step 3: Shuffle and select the final questions for the test
  const selectedQuestions = shuffle(uniqueValidQuestionIds).slice(0, params.numQuestions);

  if (selectedQuestions.length === 0) {
    return { error: 'Not enough valid questions available to create the test.' };
  }

  // Step 4: Create the test attempt directly (Logic corrected)
  // We removed the unnecessary 'select' for the container test

  // (Opcional) Genera un título para el test
  const testTitle = `Test ${params.mode} - ${selectedQuestions.length} preguntas`;

  const { data: testAttempt, error: createError } = await supabase
    .from('test_attempts')
    .insert({
      user_id: user.id,
      opposition_id: params.oppositionId,
      study_cycle_id: params.studyCycleId,
      total_questions: selectedQuestions.length,
      title: testTitle,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (createError || !testAttempt) {
    console.error('Error creating test attempt:', createError);
    return { error: 'Could not create the test attempt.' };
  }

  // Step 5: Save the (valid) questions for this attempt
  const attemptQuestions = selectedQuestions.map((q) => ({
    test_attempt_id: testAttempt.id,
    question_id: q.id,
  }));

  const { error: insertQuestionsError } = await supabase
    .from('test_attempt_questions')
    .insert(attemptQuestions);

  if (insertQuestionsError) {
    // Rollback: delete the attempt if questions couldn't be saved
    await supabase.from('test_attempts').delete().eq('id', testAttempt.id);
    console.error('Error inserting test questions:', insertQuestionsError);
    return { error: 'Could not save the questions for the test.' };
  }

  redirect(`/dashboard/tests/${testAttempt.id}`);
}

export async function submitTestAttempt(
  testAttemptId: string,
  answers: Record<string, string | null>
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not authenticated' };
  }

  try {
    const { data: attemptQuestions, error: questionsError } = await supabase
      .from('test_attempt_questions')
      .select('questions(*, answers(*))')
      .eq('test_attempt_id', testAttemptId);

    if (questionsError) {
      return { error: questionsError.message };
    }

    const questions = attemptQuestions?.map((aq) => aq.questions).filter(Boolean) ?? [];
    if (questions.length === 0) {
      return { error: 'No se encontraron preguntas para este intento.' };
    }

    let correctCount = 0;
    let incorrectCount = 0;
    const answerRowsToUpsert = [];

    // 3. Recorremos TODAS las preguntas del test
    for (const question of questions) {
      const userAnswerId = answers[question.id] || null;
      let isCorrect = false;
      let status: 'correct' | 'incorrect' | 'blank' = 'blank';

      if (userAnswerId) {
        isCorrect = question.answers.some((a) => a.id === userAnswerId && a.is_correct);
        if (isCorrect) {
          correctCount++;
          status = 'correct';
        } else {
          incorrectCount++;
          status = 'incorrect';
        }
      }

      // Preparamos la fila para insertar/actualizar
      answerRowsToUpsert.push({
        test_attempt_id: testAttemptId,
        question_id: question.id,
        selected_answer_id: userAnswerId,
        user_id: user.id,
        is_correct: isCorrect,
        status: status,
      });
    }

    // 4. Hacemos el UPSERT en test_attempt_answers con los datos completos
    const { error: answersError } = await supabase
      .from('test_attempt_answers')
      .upsert(answerRowsToUpsert, {
        onConflict: 'test_attempt_id,question_id',
      });

    if (answersError) {
      return { error: `Error saving answers: ${answersError.message}` };
    }

    const unansweredCount = questions.length - (correctCount + incorrectCount);

    const netPoints = correctCount - incorrectCount / 3;

    // 2. Aseguramos que la puntuación directa no sea negativa
    const finalNetPoints = Math.max(0, netPoints);

    const finalScore = (finalNetPoints / questions.length) * 10;

    const { error: updateError } = await supabase
      .from('test_attempts')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        score: finalScore,
        correct_answers: correctCount,
        incorrect_answers: incorrectCount,
        unanswered_questions: unansweredCount,
        net_score: finalNetPoints,
      })
      .eq('id', testAttemptId);

    if (updateError) {
      return { error: `Error finalizing attempt: ${updateError.message}` };
    }

    revalidatePath('/dashboard/tests');
    revalidatePath(`/dashboard/tests/${testAttemptId}`);

    return { success: true, attemptId: testAttemptId }; // Devolvemos el ID
  } catch (error: any) {
    return { error: `An unexpected error occurred: ${error.message}` };
  }
}

export async function deleteTestAttempt(testAttemptId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not authenticated' };
  }

  try {
    const { data: attempt, error: fetchError } = await supabase
      .from('test_attempts')
      .select('id, user_id')
      .eq('id', testAttemptId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !attempt) {
      return { error: 'Test attempt not found or not authorized to delete.' };
    }
    const { error: deleteError } = await supabase
      .from('test_attempts')
      .delete()
      .eq('id', testAttemptId);

    if (deleteError) {
      console.error('Error deleting test attempt:', deleteError);
      return { error: `Database error: ${deleteError.message}` };
    }

    // Refrescamos la página de tests para que la tabla se actualice
    revalidatePath('/dashboard/tests');

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error deleting test attempt:', error);
    return { error: `An unexpected error occurred: ${error.message}` };
  }
}
