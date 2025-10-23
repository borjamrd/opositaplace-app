'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/lib/supabase/database.types';

type QuestionWithAnswers = Tables<'questions'> & {
  answers: Tables<'answers'>[];
};

interface FailedQuestionFlashcardProps {
  questions: QuestionWithAnswers[];
}

export function FailedQuestionFlashcard({ questions }: FailedQuestionFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const handleNextQuestion = () => {
    setIsAnswerVisible(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const currentQuestion = questions[currentIndex];
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preguntas que has fallado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground h-full flex items-center justify-center">
            <p>¡Genial! Aún no tienes preguntas falladas para repasar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Preguntas que has fallado</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-semibold mb-4">{currentQuestion.text}</p>

        {isAnswerVisible && (
          <div className="space-y-2 mt-4 animate-in fade-in">
            {currentQuestion.answers.map((answer) => (
              <div
                key={answer.id}
                className={cn(
                  'p-3 rounded-md text-sm border',
                  answer.is_correct
                    ? 'bg-green-100/80 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                    : 'bg-card'
                )}
              >
                {answer.text}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={() => setIsAnswerVisible(!isAnswerVisible)}>
          <Eye className="mr-2 h-4 w-4" />
          {isAnswerVisible ? 'Ocultar' : 'Mostrar'} Respuesta
        </Button>
        <Button onClick={handleNextQuestion}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Siguiente
        </Button>
      </CardFooter>
    </Card>
  );
}
