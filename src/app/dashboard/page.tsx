import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { Tables } from '@/lib/database.types';

// Definimos el tipo aquí para que pueda ser usado tanto en el servidor como en el cliente.
export type QuestionWithAnswers = Tables<'questions'> & {
  answers: Tables<'answers'>[];
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: failedQuestionsRpc } = await supabase.rpc('get_user_failed_questions');
  let failedQuestions: QuestionWithAnswers[] = [];

  if (failedQuestionsRpc && failedQuestionsRpc.length > 0) {
    const failedQuestionIds = failedQuestionsRpc.map(q => q.question_id);
    const { data } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .in('id', failedQuestionIds);
    failedQuestions = data || [];
  }

  return <DashboardContent failedQuestions={failedQuestions} />;
}
