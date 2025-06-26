// src/actions/tests.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/database.types';

type Question = Database['public']['Tables']['questions']['Row'];
type TestMode = 'random' | 'errors' | 'topics';

interface CreateTestParams {
    mode: TestMode;
    numQuestions: number;
    topicIds?: string[];
    oppositionId: string;
    studyCycleId: string;
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
            if (!params.topicIds || params.topicIds.length === 0)
                return { error: 'Debes seleccionar al menos un tema.' };
            {
                const { data, error: topicsError } = await supabase
                    .from('questions')
                    .select('id')
                    .in('topic_id', params.topicIds);
                questionIds = data ?? [];
                error = topicsError;
            }
            break;

        case 'random':
        default:
            const { data: randomQuestions, error: randomError } = await supabase.rpc(
                'get_questions_by_opposition',
                { opp_id: params.oppositionId }
            );
            console.log({randomQuestions})
            if (randomError)
                return { error: 'No se pudieron recuperar las preguntas para el modo aleatorio.' };
            questionIds = (randomQuestions || []).map((id) => ({ id }));
            error = randomError;
            break;
    }

    if (error || !questionIds || questionIds.length === 0) {
        return { error: 'No se encontraron preguntas para los criterios seleccionados.' };
    }

    const shuffled = shuffleArray(questionIds);
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
