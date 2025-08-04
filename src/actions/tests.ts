'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Question } from '@/lib/supabase/types';
import { shuffle } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
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
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    let candidateQuestionIds: string[] = [];
    let error: any = null;

    // Step 1: Get a list of candidate question IDs based on the selected mode
    switch (params.mode) {
        case 'errors':
            const { data: failedQuestions, error: rpcError } = await supabase.rpc(
                'get_user_failed_questions'
            );
            if (rpcError) {
                console.error('Error fetching failed questions:', rpcError);
                return {
                    error: 'Could not retrieve failed questions.'
                }
            }
            candidateQuestionIds = failedQuestions || [];
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
            candidateQuestionIds = randomQuestionsData?.map((q: any) => q.id) || [];
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

    // Remove duplicates that might arise from the join
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

    // Step 4: Create the test attempt with the correct number of questions
    const { data: genericTest, error: genericTestError } = await supabase
        .from('tests')
        .select('id')
        .eq('title', 'Test Personalizado Dinámico')
        .eq('opposition_id', params.oppositionId)
        .single();

    if (genericTestError || !genericTest) {
        return { error: 'Container test for this opposition not found.' };
    }

    const { data: testAttempt, error: createError } = await supabase
        .from('test_attempts')
        .insert({
            user_id: user.id,
            opposition_id: params.oppositionId,
            study_cycle_id: params.studyCycleId,
            total_questions: selectedQuestions.length, // This is now the correct number
            test_id: genericTest.id,
        })
        .select('id')
        .single();

    if (createError || !testAttempt) {
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
        await supabase.from('test_attempts').delete().eq('id', testAttempt.id);
        return { error: 'Could not save the questions for the test.' };
    }

    redirect(`/dashboard/tests/${testAttempt.id}`);
}

export async function submitTestAttempt(testAttemptId: string, answers: Record<string, string>) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated' };
    }

    try {
        const userAnswersData = Object.entries(answers).map(([question_id, answer_id]) => ({
            test_attempt_id: testAttemptId,
            question_id,
            selected_answer_id: answer_id,
            user_id: user.id,
        }));

        const { error: answersError } = await supabase
            .from('test_attempt_answers')
            .upsert(userAnswersData, {
                onConflict: 'test_attempt_id,question_id',
            });

        if (answersError) {
            return { error: answersError.message };
        }

        const { data: attemptQuestions, error: questionsError } = await supabase
            .from('test_attempt_questions')
            .select('questions(*, answers(*))')
            .eq('test_attempt_id', testAttemptId);

        if (questionsError) {
            return { error: questionsError.message };
        }

        const questions = attemptQuestions?.map((aq) => aq.questions).filter(Boolean) ?? [];
        let correctCount = 0;
        let incorrectCount = 0;

        questions.forEach((question) => {
            const userAnswerId = answers[question.id];
            if (userAnswerId) {
                const isCorrect = question.answers.some(
                    (a) => a.id === userAnswerId && a.is_correct
                );
                if (isCorrect) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            }
        });

        const unansweredCount = questions.length - (correctCount + incorrectCount);
        const netPoints = correctCount;
        const finalScore = questions.length > 0 ? (netPoints / questions.length) * 10 : 0;

        const { error: updateError } = await supabase
            .from('test_attempts')
            .update({
                status: 'completed',
                finished_at: new Date().toISOString(),
                score: finalScore,
                correct_answers: correctCount,
                incorrect_answers: incorrectCount,
                unanswered_questions: unansweredCount,
            })
            .eq('id', testAttemptId);

        if (updateError) {
            return { error: updateError.message };
        }

        revalidatePath('/dashboard/tests');
        revalidatePath(`/dashboard/tests/${testAttemptId}`);

        return { success: true };
    } catch (error) {
        return { error: 'An unexpected error occurred.' };
    }
}
