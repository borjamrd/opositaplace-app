'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, CheckCircle2, ChevronRight, Clock, FileEdit, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PracticalCaseLink } from './practical-case-link';

interface FeaturedCaseCardProps {
  practicalCase: any | null;
  isPremium: boolean;
  className?: string;
}

export function FeaturedCaseCard({ practicalCase, isPremium, className }: FeaturedCaseCardProps) {
  if (!practicalCase) {
    return (
      <Card
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border-2',
          className
        )}
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No has realizado ningún caso práctico aún</EmptyTitle>
            <EmptyDescription>
              Selecciona un caso de la lista para comenzar a practicar. Tus casos en curso se
              mostrarán aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    );
  }

  const attempt = practicalCase.practical_case_attempts?.[0];
  const score =
    attempt?.feedback_analysis &&
    typeof attempt.feedback_analysis === 'object' &&
    'score' in attempt.feedback_analysis
      ? (attempt.feedback_analysis as any).score
      : null;

  const isCorrected = attempt?.status === 'corrected';
  const isDraft = attempt?.status === 'draft';

  return (
    <Card className={cn('flex flex-col overflow-hidden border-2 shadow-lg relative', className)}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardHeader className="md:pb-10 z-10">
        <div className="flex justify-between items-start">
          <Badge variant={isCorrected ? 'default' : 'secondary'} className="mb-4 text-sm px-3 py-1">
            {isCorrected ? 'Finalizado' : isDraft ? 'En curso (Borrador)' : 'Enviado'}
          </Badge>
          {isCorrected && score !== null && (
            <div className="flex flex-col items-end md:mb-10">
              <span
                className={cn(
                  'text-2xl font-bold',
                  score >= 5 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {score}/10
              </span>
              <span className="text-xs text-muted-foreground font-medium">Nota obtenida</span>
            </div>
          )}
        </div>

        <CardTitle className="text-3xl font-bold leading-tight line-clamp-2">
          {practicalCase.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2 font-medium">
          <Clock className="w-4 h-4" />
          Actualizado{' '}
          {formatDistanceToNow(new Date(attempt.updated_at), {
            addSuffix: true,
            locale: es,
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="hidden flex-1 md:flex flex-col overflow-y-auto space-y-6 z-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {/* Preview del Enunciado */}
        <div className="hidden md:block">
          <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-2">
            <FileEdit className="w-4 h-4" /> Extracto del enunciado
          </h4>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
            <ReactMarkdown>
              {practicalCase.statement.slice(0, 350) +
                (practicalCase.statement.length > 350 ? '...' : '')}
            </ReactMarkdown>
          </div>
        </div>

        {/* Preview de Correcciones (solo si corregido) */}
        {isCorrected && attempt?.feedback_analysis ? (
          <div className="mt-auto hidden md:block">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Feedback
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <p className="italic text-foreground/80">
                {/* Intentamos mostrar un resumen del feedback general */}
                {(attempt.feedback_analysis as any).general_feedback ||
                  'Revisa las correcciones detalladas en la vista completa.'}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="pt-4 pb-6 z-10 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm border-t">
        <Button
          asChild
          size="default"
          className="w-full shadow-md hover:shadow-lg transition-all"
          variant={isCorrected ? 'outline' : 'default'}
        >
          <PracticalCaseLink
            href={`/dashboard/practical-cases/${practicalCase.id}`}
            isPremium={isPremium}
          >
            {isCorrected ? (
              <>
                Ver corrección completa <ChevronRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                Continuar resolviendo <PlayCircle className="ml-2 w-5 h-5" />
              </>
            )}
          </PracticalCaseLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
