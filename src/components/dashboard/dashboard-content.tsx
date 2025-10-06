'use client';

import type { QuestionWithAnswers } from '@/app/dashboard/page';
import { StudySessionsChart } from '../charts/study-sessions-chart';
import { UnifiedChangeHistory } from '../scrapping/url-suscription-changes';
import { FailedQuestionFlashcard } from './failed-question-flashcard';
import { SelectiveProcessTimeline } from '../selective-process/selective-process-timeline';

interface DashboardContentProps {
  failedQuestions: QuestionWithAnswers[];
}

const DashboardContent = ({ failedQuestions }: DashboardContentProps) => {
  return (
    <div className="flex-1 grid container gap-4 md:grid-cols-2 lg:grid-cols-6">
      
      <div className="row-span-1 col-span-4">
        <StudySessionsChart />
      </div>
      <div className="row-span-4 col-span-2">
        <SelectiveProcessTimeline />
      </div>

      <div className="row-span-1 col-span-2">
        <UnifiedChangeHistory showLink />
      </div>
      <div className="row-span-1 col-span-2">
        <FailedQuestionFlashcard questions={failedQuestions} />
      </div>
    </div>
  );
};

export { DashboardContent };
