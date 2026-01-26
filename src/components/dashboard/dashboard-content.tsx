'use client';

import { QuestionWithAnswers } from '@/lib/supabase/types';
import { StudySessionsChart } from '../charts/study-sessions-chart';
import { SelectiveProcessTimeline } from '../selective-process/selective-process-timeline';
import { FailedQuestionFlashcard } from './failed-question-flashcard';
import { OppositionInfoWidget } from './opposition-info-widget';

import { StudyFeedback } from '@/app/dashboard/study-feedback';
import { useUiStore } from '@/store/ui-store';
import { SRSWidget } from './srs-widget';
import { RoadmapStatus } from './roadmap-status';
import { getRoadmapData } from '@/actions/roadmap';

interface DashboardContentProps {
  failedQuestions: QuestionWithAnswers[];
  dueCardsCount: number;
  userName: string;
  roadmapData: Awaited<ReturnType<typeof getRoadmapData>> | null;
}

const DashboardContent = ({
  failedQuestions,
  dueCardsCount,
  userName,
  roadmapData,
}: DashboardContentProps) => {
  const { dashboardSections } = useUiStore();
  const sections = [
    {
      id: 'roadmapStatus',
      className: 'row-span-1 lg:col-span-2',
      component: <RoadmapStatus data={roadmapData} href="/dashboard/roadmap" />,
    },

    {
      id: 'studySessionsChart',
      className: 'row-span-1 lg:col-span-2',
      component: <StudySessionsChart />,
    },
    {
      id: 'selectiveProcessTimeline',
      className: 'row-span-5 lg:col-span-2',
      component: <SelectiveProcessTimeline href="/dashboard/selective-process" />,
    },
    {
      id: 'srsWidget',
      className: 'row-span-1 lg:col-span-2',
      component: <SRSWidget dueCardsCount={dueCardsCount} href="/dashboard/review" />,
    },
    {
      id: 'studyFeedback',
      className: 'col-span-1 md:col-span-2 lg:col-span-2',
      component: <StudyFeedback />,
    },

    {
      id: 'failedQuestions',
      className: 'row-span-2 lg:col-span-2',
      component: <FailedQuestionFlashcard questions={failedQuestions} href="/dashboard/tests" />,
    },
    {
      id: 'oppositionInfoWidget',
      className: 'row-span-2 lg:col-span-2',
      component: <OppositionInfoWidget href="/dashboard/opposition-info" />,
    },
  ] as const;

  return (
    <div className="flex-1 container space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-newsreader text-primary">
          Hola, {userName} 👋
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {sections.map(
          ({ id, className, component }) =>
            dashboardSections[id as keyof typeof dashboardSections] && (
              <div key={id} className={className}>
                {component}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export { DashboardContent };
