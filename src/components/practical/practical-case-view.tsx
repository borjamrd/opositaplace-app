'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, LayoutPanelLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PracticalCase, PracticalCaseAttemptWithAnalysis } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { Maximize, Minimize } from 'lucide-react';
import { CaseEditor } from './case-editor';
import { CorrectionFeedback } from './correction-feedback';
import ReactMarkdown from 'react-markdown';

interface Props {
  caseData: PracticalCase;
  initialAttempt: PracticalCaseAttemptWithAnalysis | null;
}

export function PracticalCaseView({ caseData, initialAttempt }: Props) {
  const [feedback, setFeedback] = useState(initialAttempt?.feedback_analysis || null);
  const [viewMode, setViewMode] = useState<'edit' | 'feedback'>(
    initialAttempt?.status === 'corrected' ? 'feedback' : 'edit'
  );
  const [isFullScreen, setIsFullScreen] = useState(false); // New state for fullscreen

  return (
    <div
      className={cn(
        'flex flex-col',
        isFullScreen ? 'h-screen absolute inset-0 z-50 bg-background' : 'h-[calc(100vh-10rem)]'
      )}
    >
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/practical-cases">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Link>
          </Button>
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
                Mi Respuesta
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
              <ReactMarkdown>{caseData.statement}</ReactMarkdown>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {viewMode === 'edit' ? (
            <CaseEditor
              caseId={caseData.id}
              initialContent={initialAttempt?.user_answer || ''}
              onCorrectionReceived={(newAnalysis) => {
                setFeedback(newAnalysis);
                setViewMode('feedback'); // Automáticamente cambiamos a ver la nota
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
