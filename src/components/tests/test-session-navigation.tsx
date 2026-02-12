'use client';

import { Button } from '@/components/ui/button';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Using icons for toggle
import { useState } from 'react';

interface TestSessionNavigationProps {
  questions: QuestionWithAnswers[];
  userAnswers: Map<string, string | null>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  defaultOpen?: boolean;
}

export function TestSessionNavigation({
  questions,
  userAnswers,
  currentQuestionIndex,
  onQuestionSelect,
  defaultOpen,
}: TestSessionNavigationProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true);

  // Calculate actual answered count (ignoring nulls)
  const answeredCount = Array.from(userAnswers.values()).filter((v) => v !== null).length;

  return (
    <div
      className={`
        relative flex flex-col md:border-l bg-muted/10 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-full lg:w-[280px]' : 'w-0 lg:w-0'}
      `}
    >
      {/* Toggle Button */}
      <div className="hidden md:block absolute top-4 -left-3 z-20">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 rounded-full shadow-md bg-background border-border hover:bg-accent"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Ocultar navegación' : 'Mostrar navegación'}
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div
        className={`flex flex-col h-full overflow-hidden ${!isOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
      >
        <div className="p-4 font-semibold text-sm text-muted-foreground border-b flex justify-between items-center shrink-0">
          <span>Navegador</span>
          <span className="text-xs font-normal">
            {answeredCount} / {questions.length} respondidas
          </span>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers.get(q.id) !== null;
              const isCurrent = currentQuestionIndex === idx;

              return (
                <Button
                  key={q.id}
                  variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                  size="sm"
                  className={`
                    h-10 w-full p-0 text-xs font-medium
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${!isCurrent && !isAnswered ? 'text-muted-foreground hover:text-foreground' : ''}
                  `}
                  onClick={() => onQuestionSelect(idx)}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
