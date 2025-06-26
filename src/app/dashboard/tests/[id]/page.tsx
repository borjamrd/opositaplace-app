// src/app/dashboard/tests/[id]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { TestSession } from '@/components/tests/test-session';

// ... (El tipo QuestionWithAnswers no cambia)
export type QuestionWithAnswers = {
    id: string;
    text: string;
    answers: {
        id: string;
        text: string;
    }[];
};

export default async function TestAttemptPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: testAttempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (attemptError || !testAttempt) {
        notFound();
    }

    const { data: questionsData, error: questionsError } = await supabase
        .from('test_attempt_questions')
        .select(
            `
            questions (
                id,
                text,
                answers (id, text)
            )
        `
        )
        .eq('test_attempt_id', testAttempt.id)
        .order('created_at', { ascending: true });

    if (questionsError || !questionsData) {
        console.error('Error al cargar preguntas del test:', questionsError);
        return <p>Error al cargar las preguntas del test.</p>;
    }

    const questions: QuestionWithAnswers[] = questionsData
        .map((item) => item.questions)
        .filter(Boolean) as QuestionWithAnswers[];

    return (
        <div className="container mx-auto py-8">
            <TestSession testAttempt={testAttempt} questions={questions} />
        </div>
    );
}
