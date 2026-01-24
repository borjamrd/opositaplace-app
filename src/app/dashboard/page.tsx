import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { shuffle } from '@/lib/utils';
import { getDueReviewCards } from '@/actions/srs';

import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getSessionData();

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

  const dueCards = await getDueReviewCards();
  const dueCardsCount = dueCards.length;

  let roadmapData = null;
  try {
    const { getRoadmapData } = await import('@/actions/roadmap');
    roadmapData = await getRoadmapData();
  } catch (error) {
    console.error('Failed to fetch roadmap data:', error);
  }

  return (
    <DashboardContent
      failedQuestions={failedQuestions}
      dueCardsCount={dueCardsCount}
      userName={profile?.username || 'Opositor'}
      roadmapData={roadmapData}
    />
  );
}
