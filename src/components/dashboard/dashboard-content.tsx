'use client';

import { QuestionWithAnswers } from '@/lib/supabase/types';
import { StudySessionsChart } from '../charts/study-sessions-chart';
import { SelectiveProcessTimeline } from '../selective-process/selective-process-timeline';
import { FailedQuestionFlashcard } from './failed-question-flashcard';

import { StudyFeedback } from '@/app/dashboard/study-feedback';
import { SRSWidget } from './srs-widget';
import { useUiStore } from '@/store/ui-store';
import { PageContainer } from '../page-container';

interface DashboardContentProps {
  failedQuestions: QuestionWithAnswers[];
  dueCardsCount: number;
}

const DashboardContent = ({ failedQuestions, dueCardsCount }: DashboardContentProps) => {
  const { dashboardSections } = useUiStore();
  const sections = [
    {
      id: 'studyFeedback',
      className: 'col-span-1 md:col-span-2 lg:col-span-4',
      component: <StudyFeedback />,
    },
    {
      id: 'selectiveProcessTimeline',
      className: 'row-span-5 lg:col-span-2',
      component: <SelectiveProcessTimeline />,
    },
    {
      id: 'studySessionsChart',
      className: 'row-span-1 lg:col-span-4',
      component: <StudySessionsChart />,
    },
    {
      id: 'srsWidget',
      className: 'row-span-1 lg:col-span-2',
      component: <SRSWidget dueCardsCount={dueCardsCount} href="/dashboard/review" />,
    },
    {
      id: 'failedQuestions',
      className: 'row-span-2 lg:col-span-2',
      component: <FailedQuestionFlashcard questions={failedQuestions} />,
    },
  ] as const;

  return (
    <div className="flex-1 grid container gap-4 md:grid-cols-2 lg:grid-cols-6">
      {sections.map(
        ({ id, className, component }) =>
          dashboardSections[id as keyof typeof dashboardSections] && (
            <div key={id} className={className}>
              {component}
            </div>
          )
      )}
    </div>
  );
};

export { DashboardContent };
