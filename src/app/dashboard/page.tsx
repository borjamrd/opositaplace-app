import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { shuffle } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: failedQuestionsRpc } = await supabase.rpc('get_user_failed_questions');
  let failedQuestions: QuestionWithAnswers[] = [];

  if (failedQuestionsRpc && failedQuestionsRpc.length > 0) {
    const failedQuestionIds = failedQuestionsRpc.map((q) => q.question_id);
    const { data } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .in('id', failedQuestionIds);

    if (data) {
      failedQuestions = shuffle(data);
    }
  }

  return (
      <DashboardContent failedQuestions={failedQuestions} />
  );
}
