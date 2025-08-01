// src/actions/tests.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Question } from '@/lib/supabase/types';
import { shuffle } from '@/lib/utils';
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
    if (!user) return { error: 'Usuario no autenticado' };

    let questionIds: Pick<Question, 'id'>[] = [];
    let error: any = null;

    switch (params.mode) {
        case 'errors':
            const { data: failedQuestions, error: rpcError } = await supabase.rpc(
                'get_user_failed_questions'
            );
            if (rpcError) return { error: 'No se pudieron recuperar las preguntas falladas.' };
            questionIds = (failedQuestions || []).map((id) => ({ id }));
            break;

        case 'topics':
            if (!params.topicIds || params.topicIds.length === 0) {
                return { error: 'Debes seleccionar al menos un tema.' };
            }
            const { data: topicQuestions, error: topicsError } = await supabase
                .from('questions')
                .select('id, topics!inner(block_id, blocks!inner(opposition_id))')
                .in('topic_id', params.topicIds)
                .eq('topics.blocks.opposition_id', params.oppositionId);

            questionIds = topicQuestions?.map((q) => ({ id: q.id })) || [];
            error = topicsError;
            break;
        case 'random':
        default:
            const { data: randomQuestionsData, error: randomError } = await supabase.rpc(
                'get_questions_by_opposition',
                { opp_id: params.oppositionId, include_no_topic: params.includeNoTopic }
            );

            if (randomError) {
                console.error('Error en RPC get_questions_by_opposition:', randomError);
                return { error: 'No se pudieron recuperar las preguntas para el modo aleatorio.' };
            }
            // `randomQuestionsData` es el array que necesitas
            questionIds = randomQuestionsData?.map((q: any) => ({ id: q.id })) || [];
            break;
    }

    if (error || !questionIds || questionIds.length === 0) {
        return { error: 'No se encontraron preguntas para los criterios seleccionados.' };
    }

    const shuffled = shuffle(questionIds);
    const selectedQuestions = shuffled.slice(0, params.numQuestions);

    if (selectedQuestions.length === 0) {
        return { error: 'No hay suficientes preguntas disponibles para crear el test.' };
    }

    // --- CAMBIO 1: Buscar el ID del test genérico que creamos ---
    const { data: genericTest, error: genericTestError } = await supabase
        .from('tests')
        .select('id')
        .eq('title', 'Test Personalizado Dinámico')
        .eq('opposition_id', params.oppositionId)
        .single();

    if (genericTestError || !genericTest) {
        return { error: 'No se encontró el test contenedor para esta oposición.' };
    }

    // --- CORRECCIÓN en la inserción ---
    const { data: testAttempt, error: createError } = await supabase
        .from('test_attempts')
        .insert({
            user_id: user.id,
            opposition_id: params.oppositionId,
            study_cycle_id: params.studyCycleId,
            total_questions: selectedQuestions.length,
            test_id: genericTest.id, // <-- Usamos el ID correcto
        })
        .select('id')
        .single();

    if (createError || !testAttempt) {
        console.error('Error creating test attempt:', createError);
        return { error: 'No se pudo crear el intento de test.' };
    }

    // --- CAMBIO 2: Añadir un valor por defecto para `is_correct` ---
    // Al inicio de un test, ninguna pregunta está contestada (o todas son incorrectas por defecto).
    // Tu esquema dice que `is_correct` no puede ser nulo.
    // El campo `answer_id` sí puede ser nulo, lo que indica que no se ha respondido.
    const attemptQuestions = selectedQuestions.map((q) => ({
        test_attempt_id: testAttempt.id,
        question_id: q.id,
        is_correct: false,
        answer_id: null,
    }));

    const { error: insertQuestionsError } = await supabase
        .from('test_attempt_questions')
        .insert(attemptQuestions);

    if (insertQuestionsError) {
        await supabase.from('test_attempts').delete().eq('id', testAttempt.id);
        return { error: 'No se pudieron guardar las preguntas del test.' };
    }

    redirect(`/dashboard/tests/${testAttempt.id}`);
}

export async function submitTestAttempt(
    testAttemptId: string,
    userAnswers: Record<string, string> // formato: { questionId: answerId }
) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuario no autenticado' };

    try {
        // 1. Obtener las preguntas y sus respuestas correctas para este intento
        const { data: correctAnswersData, error: correctAnswersError } = await supabase
            .from('test_attempt_questions')
            .select(
                `
                question_id,
                questions (
                    answers (id, is_correct)
                )
            `
            )
            .eq('test_attempt_id', testAttemptId);

        if (correctAnswersError) throw correctAnswersError;

        const correctAnswersMap = new Map<string, string>();
        correctAnswersData.forEach((item) => {
            const question = item.questions;
            if (question && question.answers) {
                const correctAnswer = question.answers.find((a) => a.is_correct);
                if (correctAnswer) {
                    correctAnswersMap.set(item.question_id, correctAnswer.id);
                }
            }
        });

        // 2. Calcular la puntuación
        let correctCount = 0;
        let incorrectCount = 0;

        const answerUpdates = Object.entries(userAnswers).map(([questionId, answerId]) => {
            const isCorrect = correctAnswersMap.get(questionId) === answerId;
            if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }
            return {
                test_attempt_id: testAttemptId,
                question_id: questionId,
                answer_id: answerId,
                is_correct: isCorrect,
            };
        });

        // 3. Actualizar las respuestas del usuario en la tabla `test_attempt_questions`
        const { error: updateAnswersError } = await supabase
            .from('test_attempt_questions')
            .upsert(answerUpdates, { onConflict: 'test_attempt_id, question_id' });

        if (updateAnswersError) throw updateAnswersError;

        // 4. Actualizar el registro principal de `test_attempts` con el resultado final
        const totalAnswered = correctCount + incorrectCount;
        const totalQuestions = correctAnswersData.length;
        // Puntuación sobre 10: (aciertos - (fallos / 2)) * (10 / total_preguntas) -> Ajusta esta fórmula si quieres otra
        const score = Math.max(0, (correctCount - incorrectCount / 2) * (10 / totalQuestions));

        const { error: updateAttemptError } = await supabase
            .from('test_attempts')
            .update({
                completed_at: new Date().toISOString(),
                correct_answers: correctCount,
                wrong_answers: incorrectCount,
                score: score,
            })
            .eq('id', testAttemptId)
            .eq('user_id', user.id);

        if (updateAttemptError) throw updateAttemptError;
    } catch (error: any) {
        console.error('Error submitting test:', error);
        return { error: 'No se pudo guardar el resultado del test.' };
    }

    // 5. Redirigir a la página de resultados (crea esta página más adelante)
    redirect(`/dashboard/tests/results/${testAttemptId}`);
}
