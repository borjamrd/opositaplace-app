'use client';

import { QuestionWithAnswers } from '@/lib/supabase/types';
import { StudySessionsChart } from '../charts/study-sessions-chart';
import { SelectiveProcessTimeline } from '../selective-process/selective-process-timeline';
import { FailedQuestionFlashcard } from './failed-question-flashcard';

import { StudyFeedback } from '@/app/dashboard/study-feedback';
import { SRSWidget } from './srs-widget';

interface DashboardContentProps {
  failedQuestions: QuestionWithAnswers[];
  dueCardsCount: number;
}

const DashboardContent = ({ failedQuestions, dueCardsCount }: DashboardContentProps) => {
  return (
    <div className="flex-1 grid container gap-4 md:grid-cols-2 lg:grid-cols-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-6">
        <StudyFeedback />
      </div>

      <div className="row-span-1 lg:col-span-4">
        <StudySessionsChart />
      </div>
      <div className="row-span-4 lg:col-span-2">
        <SelectiveProcessTimeline />
      </div>
      <div className="row-span-1 lg:col-span-2">
        <SRSWidget dueCardsCount={dueCardsCount} />
      </div>
      <div className="row-span-1 lg:col-span-4">
        <FailedQuestionFlashcard questions={failedQuestions} />
      </div>
    </div>
  );
};

export { DashboardContent };
