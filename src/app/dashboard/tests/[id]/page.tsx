import { TestResults } from '@/components/tests/test-results';
import { TestSession } from '@/components/tests/test-session';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { Terminal } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

export default async function TestPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: testAttempt, error: testAttemptError } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('id', id)
    .single();

  if (testAttemptError || !testAttempt) {
    return notFound();
  }

  const { data: attemptQuestions, error: attemptQuestionsError } = await supabase
    .from('test_attempt_questions')
    .select(`questions(*, answers(*))`)
    .eq('test_attempt_id', testAttempt.id);

  if (attemptQuestionsError) {
    console.error('Error fetching attempt_questions:', attemptQuestionsError);
    return (
      <div className="container mx-auto mt-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las preguntas del test. Por favor, inténtalo de nuevo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const allQuestions: QuestionWithAnswers[] =
    attemptQuestions?.map((aq) => aq.questions).filter(Boolean) ?? [];

  const validQuestions = allQuestions.filter((question) =>
    question.answers.some((answer) => answer.is_correct)
  );

  if (validQuestions.length === 0) {
    return (
      <div className="container mx-auto mt-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>No hay preguntas válidas</AlertTitle>
          <AlertDescription>
            Este test no se puede iniciar porque no contiene preguntas con respuestas correctas
            definidas. Por favor, contacta con el administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (testAttempt.status === 'completed') {
    const { data: savedAnswersData, error: answersError } = await supabase
      .from('test_attempt_answers')
      .select('question_id, selected_answer_id')
      .eq('test_attempt_id', testAttempt.id);

    if (answersError) {
      return (
        <div className="container mx-auto mt-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las respuestas guardadas para este test.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    const userAnswers =
      savedAnswersData?.reduce(
        (acc, item) => {
          if (item.question_id && item.selected_answer_id) {
            acc[item.question_id] = item.selected_answer_id;
          }
          return acc;
        },
        {} as Record<string, string>
      ) ?? {};

    const questionIds = allQuestions.map((q) => q.id);
    const { data: existingSrsCards } = await supabase
      .from('srs_cards')
      .select('source_question_id')
      .eq('user_id', user.id)
      .in('source_question_id', questionIds);

    const addedCardIds =
      existingSrsCards
        ?.map((card) => card.source_question_id)
        .filter((id): id is string => id !== null) || [];

    return (
      <TestResults
        questions={allQuestions}
        userAnswers={userAnswers}
        attempt={testAttempt}
        addedCardIds={addedCardIds}
      />
    );
  }

  return <TestSession testAttempt={testAttempt} questions={validQuestions} />;
}
