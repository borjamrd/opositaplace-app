'use client';

import { generateSmartFeedback } from '@/actions/study-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyFeedbackData } from '@/hooks/use-study-feedback';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function StudyFeedback() {
  const queryClient = useQueryClient();

  const {
    data: contextData,
    isLoading: isLoadingContext,
    isRefetching: isRefetchingContext,
  } = useStudyFeedbackData();

  const {
    data: feedbackText,
    isLoading: isLoadingFeedback,
    isRefetching: isRefetchingFeedback,
  } = useQuery({
    queryKey: ['ai-feedback', contextData],
    queryFn: () => generateSmartFeedback(contextData!),
    enabled: !!contextData,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: ['study-feedback-context'] });
    queryClient.invalidateQueries({ queryKey: ['ai-feedback'] });
  };

  const isUpdating = isRefetchingContext || isRefetchingFeedback;

  if (isLoadingContext || isLoadingFeedback) {
    return <FeedbackSkeleton />;
  }

  if (!contextData || !feedbackText) return null;

  return (
    <Card className="bg-linear-to-r from-indigo-50 to-blue-50 border-indigo-100 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 shadow-sm h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          Análisis de tu progreso semanal
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-indigo-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          onClick={handleReload}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span className="sr-only">Actualizar feedback</span>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{feedbackText}</p>

        <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            ⏱️ <strong>{contextData.actualStudyHours}h</strong> estudiadas
          </span>
          <span>
            📝 <strong>{contextData.recentTests.length}</strong> tests esta semana
          </span>
        </div>
      </CardContent>
      {contextData.recentTests.length === 0 && (
        <CardFooter>
          <Button className="w-full" size="sm">
            <Link href="/dashboard/tests">Realiza un test</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function FeedbackSkeleton() {
  return (
    <Card className="border-dashed border-slate-200 shadow-none">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-[80%]" />
      </CardContent>
    </Card>
  );
}
