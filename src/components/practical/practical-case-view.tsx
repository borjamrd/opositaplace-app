'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Copy, LayoutPanelLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PracticalCase, PracticalCaseAttemptWithAnalysis } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { Maximize, Minimize } from 'lucide-react';
import MarkdownContent from '../markdown-content';
import { CaseEditor } from './case-editor';
import { CorrectionFeedback } from './correction-feedback';

interface Props {
  caseData: PracticalCase;
  initialAttempt: PracticalCaseAttemptWithAnalysis | null;
  showBackButton?: boolean;
  isMock?: boolean;
  onCaseFinished?: () => void;
  isOnboarding?: boolean;
}

export function PracticalCaseView({
  caseData,
  initialAttempt,
  showBackButton = true,
  isMock = false,
  isOnboarding = false,
  onCaseFinished,
}: Props) {
  const [feedback, setFeedback] = useState(initialAttempt?.feedback_analysis || null);
  const [viewMode, setViewMode] = useState<'edit' | 'feedback'>(
    initialAttempt?.status === 'corrected' ? 'feedback' : 'edit'
  );
  const [isFullScreen, setIsFullScreen] = useState(false); // New state for fullscreen
  const copyText =
    'Según el artículo 23 de la Ley 40/2015 de Régimen Jurídico del Sector Público, concurre causa de abstención en Don Severo por parentesco de afinidad dentro del segundo grado con el titular de la empresa propuesta. Como funcionario, el EBEP me exige actuar con imparcialidad, por lo que debo advertir de esta circunstancia de abstención y, en caso reiterado, salvar mi responsabilidad por escrito.';

  return (
    <div
      className={cn(
        'flex flex-col',
        isFullScreen ? 'h-screen absolute inset-0 z-50 bg-background' : 'h-[calc(100vh-10rem)]'
      )}
    >
      {isOnboarding && (
        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-left mx-auto mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-medium">
            Este es un caso práctico de prueba. Copia el siguiente texto y pégalo directamente en la
            respuesta y haz clic en "Corregir".
          </p>
          <div className="relative bg-white dark:bg-slate-900 border rounded-md p-4 pr-12 text-sm text-slate-700 dark:text-slate-300">
            {copyText}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-slate-600"
              onClick={() => navigator.clipboard.writeText(copyText)}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/practical-cases">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">{caseData.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <div className="flex bg-muted p-1 rounded-md">
              <Button
                variant={viewMode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('edit')}
                className="h-7 text-xs"
              >
                Mi respuesta
              </Button>
              <Button
                variant={viewMode === 'feedback' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('feedback')}
                className="h-7 text-xs"
              >
                Última corrección
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full lg:w-[40%] border-r bg-muted/5 hidden lg:block">
          <ScrollArea className="h-full">
            <div className="p-8 prose prose-sm dark:prose-invert max-w-none">
              <h3 className="flex items-center gap-2 text-foreground/80 mb-4">
                <LayoutPanelLeft className="w-4 h-4" /> Enunciado
              </h3>
              <MarkdownContent>{caseData.statement}</MarkdownContent>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {viewMode === 'edit' ? (
            <CaseEditor
              caseId={caseData.id}
              initialContent={initialAttempt?.user_answer || ''}
              isMock={isMock || isOnboarding}
              onCorrectionReceived={(newAnalysis) => {
                setFeedback(newAnalysis);
                setViewMode('feedback');
                onCaseFinished?.();
              }}
            />
          ) : (
            <ScrollArea className="h-full p-6 bg-slate-50 dark:bg-slate-950/50">
              <div className="max-w-2xl mx-auto">
                {feedback && <CorrectionFeedback analysis={feedback} />}

                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setViewMode('edit')}>
                    Revisar o mejorar mi respuesta
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
