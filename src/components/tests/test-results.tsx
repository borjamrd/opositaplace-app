'use client';

import { createReviewCard } from '@/actions/srs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Json, QuestionWithAnswers, TestAttempt } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { Check, CheckCircle, HelpCircle, Info, Lightbulb, Loader2, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface TestResultsProps {
  questions: QuestionWithAnswers[];
  userAnswers: Record<string, string | null>;
  attempt?: TestAttempt;
  addedCardIds: string[];
}

export function TestResults({ questions, userAnswers, attempt, addedCardIds }: TestResultsProps) {
  const { toast } = useToast();
  const [addedIds, setAddedIds] = useState(new Set(addedCardIds));
  const [isAddingId, setIsAddingId] = useState<string | null>(null);

  // Calculamos los valores para que el acordeón se abra por defecto
  const allAccordionValues = useMemo(
    () => questions.map((_, index) => `item-${index}`),
    [questions]
  );

  const { correctCount, incorrectCount, unansweredCount, finalScore, netPoints } = useMemo(() => {
    if (attempt?.score !== null && attempt?.score !== undefined) {
      return {
        correctCount: attempt.correct_answers ?? 0,
        incorrectCount: attempt.incorrect_answers ?? 0,
        unansweredCount: attempt.unanswered_questions ?? 0,
        finalScore: Number(attempt.score),
        netPoints: attempt.net_score ?? 0,
      };
    }

    let correct = 0;
    let incorrect = 0;
    questions.forEach((question) => {
      const userAnswerId = userAnswers[question.id];

      if (userAnswerId) {
        const isCorrect = question.answers.some((a) => a.id === userAnswerId && a.is_correct);
        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const unanswered = questions.length - (correct + incorrect);
    const net = correct - incorrect / 3;
    const finalNet = Math.max(0, net);
    const score = questions.length > 0 ? (finalNet / questions.length) * 10 : 0;

    return {
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      finalScore: score,
      netPoints: finalNet,
    };
  }, [questions, userAnswers, attempt]);

  const totalQuestions = questions.length;

  const handleAddToReview = async (question: QuestionWithAnswers) => {
    if (isAddingId) return;
    setIsAddingId(question.id);

    const correctAnswer = question.answers.find((a) => a.is_correct);
    const frontContent: Json = { text: question.text };
    const backContent: Json = {
      text: correctAnswer?.text || 'Error: Respuesta no encontrada',
    };

    try {
      await createReviewCard({
        frontContent: frontContent,
        backContent: backContent,
        sourceQuestionId: question.id,
      });
      toast({
        title: '¡Genial!',
        description: 'Tarjeta añadida a tu mazo de repaso.',
      });

      setAddedIds((prev) => new Set(prev).add(question.id));
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingId(null);
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Resumen del test</CardTitle>
          <Button asChild variant="outline">
            <Link href="/dashboard/tests">Volver a Tests</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* HEADER: Puntuación (1/4) y Badges (3/4) */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          {/* Izquierda: Puntuación - Ocupa 1/4 en pantallas grandes */}
          <div className="w-full lg:w-1/4 flex flex-col justify-center items-center p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-lg font-medium text-muted-foreground mb-2">Nota Final</p>
            <div className="relative flex items-center justify-center">
              <span
                className={cn(
                  'text-6xl font-bold',
                  finalScore >= 5 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {finalScore.toFixed(2)}
              </span>
              <span className="text-xl text-muted-foreground ml-1 mt-6">/10</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Neta: {netPoints.toFixed(2)} / {totalQuestions}
            </p>
          </div>

          {/* Derecha: Badges - Ocupa 3/4 en pantallas grandes */}
          <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-center p-4 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-3xl font-bold text-green-700 dark:text-green-500">
                {correctCount}
              </span>
              <span className="text-sm font-semibold text-green-800 dark:text-green-400">
                Correctas
              </span>
            </div>

            <div className="flex flex-col justify-center items-center p-4 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl">
              <XCircle className="w-8 h-8 text-red-600 mb-2" />
              <span className="text-3xl font-bold text-red-700 dark:text-red-500">
                {incorrectCount}
              </span>
              <span className="text-sm font-semibold text-red-800 dark:text-red-400">
                Incorrectas
              </span>
            </div>

            <div className="flex flex-col justify-center items-center p-4 bg-gray-100/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl">
              <HelpCircle className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                {unansweredCount}
              </span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-500">
                En Blanco
              </span>
            </div>
          </div>
        </div>

        {/* LISTADO DE PREGUNTAS */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Revisión detallada</h3>
          <Accordion
            type="multiple"
            className="w-full space-y-4"
            defaultValue={allAccordionValues} // Abiertas por defecto
          >
            {questions.map((question, index) => {
              const userAnswerId = userAnswers[question.id];
              const correctAnswer = question.answers.find((a) => a.is_correct);
              const isUserCorrect = userAnswerId === correctAnswer?.id;
              const wasIncorrect = userAnswerId && !isUserCorrect;
              const isAlreadyAdded = addedIds.has(question.id);
              const isAdding = isAddingId === question.id;

              return (
                <AccordionItem
                  value={`item-${index}`}
                  key={question.id}
                  className="border rounded-lg px-4 data-[state=open]:bg-accent/5 dark:data-[state=open]:bg-accent/5"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-start text-left gap-3">
                      {userAnswerId ? (
                        isUserCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <HelpCircle className="h-6 w-6 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-base font-medium leading-normal">
                        {index + 1}. {question.text}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                      {/* COLUMNA IZQUIERDA: RESPUESTAS (Ocupa 2/3 en desktop) */}
                      <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Opciones:
                        </h4>
                        <ul className="space-y-2">
                          {question.answers.map((answer, ansIndex) => {
                            const isCorrect = answer.is_correct;
                            const isSelected = answer.id === userAnswerId;
                            const letter = String.fromCharCode(65 + ansIndex); // A, B, C, D...

                            return (
                              <li
                                key={answer.id}
                                className={cn(
                                  'flex items-start gap-3 p-3 rounded-lg text-sm border transition-colors',
                                  isCorrect
                                    ? 'bg-green-100/50 border-green-200 dark:bg-green-900/20 dark:border-green-900 text-green-900 dark:text-green-100'
                                    : isSelected
                                      ? 'bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-900 text-red-900 dark:text-red-100'
                                      : 'bg-card border-transparent hover:bg-accent/50'
                                )}
                              >
                                <div className="flex items-center gap-2 shrink-0 font-mono font-bold mt-0.5">
                                  <span className="opacity-70">{letter}.</span>
                                  {isCorrect ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : isSelected ? (
                                    <X className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <div className="w-4 h-4" /> // Espaciador
                                  )}
                                </div>
                                <span className="leading-relaxed">{answer.text}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* COLUMNA DERECHA: EXPLICACIÓN (Ocupa 1/3 en desktop) */}
                      <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                        <div className="bg-muted/30 rounded-lg p-4 border h-full">
                          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary">
                            <Lightbulb className="h-4 w-4" />
                            Explicación
                          </div>

                          {question.explanation ? (
                            <div className="text-sm text-muted-foreground leading-relaxed">
                              {question.explanation}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                              <Info className="h-4 w-4" />
                              No hay explicación disponible para esta pregunta.
                            </div>
                          )}
                        </div>

                        {/* Botón para añadir a repaso (si falló) */}
                        {wasIncorrect && (
                          <Button
                            variant={isAlreadyAdded ? 'secondary' : 'default'}
                            className="w-full"
                            onClick={() => handleAddToReview(question)}
                            disabled={isAlreadyAdded || isAdding}
                          >
                            {isAdding ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isAlreadyAdded ? (
                              <Check className="mr-2 h-4 w-4" />
                            ) : (
                              <span className="mr-2 text-lg">+</span>
                            )}
                            {isAdding
                              ? 'Añadiendo...'
                              : isAlreadyAdded
                                ? 'Añadido a Repaso'
                                : 'Añadir a Repaso Espaciado'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
