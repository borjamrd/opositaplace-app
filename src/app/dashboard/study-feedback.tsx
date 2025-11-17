'use client';

import { generateSmartFeedback } from '@/actions/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyFeedbackData } from '@/hooks/use-study-feedback';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

export function StudyFeedback() {
  // 1. Obtener los datos "crudos" (Rápido)
  const { data: contextData, isLoading: isLoadingContext } = useStudyFeedbackData();

  // 2. Generar el feedback con IA (Lento - depende de los datos anteriores)
  const { data: feedbackText, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['ai-feedback', contextData],
    queryFn: () => generateSmartFeedback(contextData!),
    enabled: !!contextData,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  if (isLoadingContext || isLoadingFeedback) {
    return <FeedbackSkeleton />;
  }

  if (!contextData || !feedbackText) return null;

  return (
    <Card className="bg-linear-to-r from-indigo-50 to-blue-50 border-indigo-100 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          Análisis de tu progreso
        </CardTitle>
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
