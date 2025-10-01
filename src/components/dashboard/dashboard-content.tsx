'use client';

import type { QuestionWithAnswers } from '@/app/dashboard/page';
import { StudySessionsChart } from '../charts/study-sessions-chart';
import { UnifiedChangeHistory } from '../scrapping/url-suscription-changes';
import { FailedQuestionFlashcard } from './failed-question-flashcard';

interface DashboardContentProps {
  failedQuestions: QuestionWithAnswers[];
}

const DashboardContent = ({ failedQuestions }: DashboardContentProps) => {
  return (
    <div className="flex-1 grid container p-20 gap-4 md:grid-cols-2 lg:grid-cols-2">
      <div className="row-1 col-1">
        <StudySessionsChart />
      </div>
      <div className="row-span-2 col-1">
        <UnifiedChangeHistory showLink />
      </div>
      <div className="row-span-1 col-1">
        <FailedQuestionFlashcard questions={failedQuestions} />
      </div>
    </div>
  );
};

export { DashboardContent };

