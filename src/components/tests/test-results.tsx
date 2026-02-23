'use client';

import { createReviewCard } from '@/actions/srs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Json, QuestionWithAnswers, TestAttempt } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Flag,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Repeat,
  X,
  XCircle,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import MarkdownContent from '../markdown-content';
import { ReportQuestionDialog } from './report-question-dialog';
import { TestSessionNavigation } from './test-session-navigation';

interface TestResultsProps {
  questions: QuestionWithAnswers[];
  userAnswers: Record<string, string | null>;
  attempt?: TestAttempt;
  addedCardIds: string[];
  isMockTest?: boolean;
  defaultOpenNavigation?: boolean;
}

export function TestResults({
  questions,
  userAnswers,
  attempt,
  addedCardIds,
  isMockTest,
  defaultOpenNavigation,
}: TestResultsProps) {
  const { toast } = useToast();
  const questionHeaderRef = useRef<HTMLDivElement>(null);
  const [addedIds, setAddedIds] = useState(new Set(addedCardIds));
  const [isAddingId, setIsAddingId] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Convert Record to Map for Navigation compatibility
  const userAnswersMap = useMemo(() => {
    return new Map(Object.entries(userAnswers));
  }, [userAnswers]);

  // Carousel State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Track indices that have been navigated AWAY from, effectively "visited" in history
  // However, we also want to animate the *first* one on mount.
  // We'll track "visited" as "has been viewed".
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set());

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
    if (isMockTest) {
      toast({
        title: '¡Genial!',
        description:
          'Tarjeta añadida a tu mazo de repaso. Más adelante abordaremos esta sección ;)',
      });
      return;
    }
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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setVisitedIndices((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex((prev) => prev + 1);
      questionHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      // We mark current as visited too, though likely already visited if we are here
      setVisitedIndices((prev) => new Set(prev).add(currentQuestionIndex));
      setCurrentQuestionIndex((prev) => prev - 1);
      questionHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentUserAnswerId = userAnswers[currentQuestion.id];
  const currentCorrectAnswer = currentQuestion.answers.find((a) => a.is_correct);
  const isUserCorrect = currentUserAnswerId === currentCorrectAnswer?.id;
  const wasIncorrect = currentUserAnswerId && !isUserCorrect;
  const isAlreadyAdded = addedIds.has(currentQuestion.id);
  const isAdding = isAddingId === currentQuestion.id;

  // Determine if we should animate elements sequentially
  const shouldAnimate = !visitedIndices.has(currentQuestionIndex);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-8">
      {/* HEADER: Puntuación y Badges (Animado de izq a derecha) */}
      <motion.div
        className="flex lg:flex-row gap-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Izquierda: Puntuación */}
        <motion.div
          className="w-1/2 lg:w-1/4 flex flex-col justify-center items-center p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-lg font-medium text-muted-foreground">Nota final</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 text-xs">
                  <p>
                    * Cálculo de la puntuación neta: (Correctas × 1) - (Incorrectas / 3). La
                    calificación final es la puntuación neta ajustada a una escala de 0 a 10. Las
                    preguntas en blanco no penalizan.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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
        </motion.div>

        {/* Derecha: Badges */}
        <div className="w-1/2 lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="flex flex-col justify-center items-center p-4 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl"
            variants={itemVariants}
          >
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-3xl font-bold text-green-700 dark:text-green-500">
              {correctCount}
            </span>
            <span className="text-sm font-semibold text-green-800 dark:text-green-400">
              Correctas
            </span>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center items-center p-4 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl"
            variants={itemVariants}
          >
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-3xl font-bold text-red-700 dark:text-red-500">
              {incorrectCount}
            </span>
            <span className="text-sm font-semibold text-red-800 dark:text-red-400">
              Incorrectas
            </span>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center items-center p-4 bg-gray-100/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl"
            variants={itemVariants}
          >
            <HelpCircle className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-3xl font-bold text-gray-700 dark:text-gray-400">
              {unansweredCount}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-500">
              En Blanco
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* CAROUSEL & NAVIGATION SECTION */}
      <Card className="flex flex-col lg:flex-row overflow-hidden border-none shadow-none bg-transparent">
        <div className="flex-1 min-w-0 space-y-4 lg:pr-10">
          <div ref={questionHeaderRef} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setShowReportDialog(true)}
                title="Reportar pregunta"
              >
                <Flag className="h-4 w-4 mr-2" />
                <span>Reportar</span>
              </Button>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="md:border md:rounded-lg pt-4 md:p-6 bg-card"
              >
                {/* Header Question */}
                <motion.div
                  initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-3 mb-6"
                >
                  {currentUserAnswerId ? (
                    isUserCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <HelpCircle className="h-6 w-6 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-lg font-medium leading-relaxed">{currentQuestion.text}</div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Answers */}
                  <motion.div
                    className="lg:col-span-2 space-y-3"
                    initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: shouldAnimate ? 0.3 : 0 }}
                  >
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Opciones:</h4>
                    <ul className="space-y-2">
                      {currentQuestion.answers.map((answer, ansIndex) => {
                        const isCorrect = answer.is_correct;
                        const isSelected = answer.id === currentUserAnswerId;
                        const letter = String.fromCharCode(65 + ansIndex);

                        return (
                          <li
                            key={answer.id}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg text-sm border transition-colors',
                              isCorrect
                                ? 'bg-green-100/50 border-green-200 dark:bg-green-900/20 dark:border-green-900 text-green-900 dark:text-green-100'
                                : isSelected
                                  ? 'bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-900 text-red-900 dark:text-red-100'
                                  : 'bg-card border-transparent'
                            )}
                          >
                            <div className="flex items-center gap-2 shrink-0 font-mono font-bold mt-0.5">
                              <span className="opacity-70">{letter}.</span>
                              {isCorrect ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : isSelected ? (
                                <X className="h-4 w-4 text-red-600" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </div>
                            <span className="leading-relaxed">{answer.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>

                  {/* Explanation */}
                  <motion.div
                    className="lg:col-span-3 flex flex-col gap-4 h-full"
                    initial={shouldAnimate ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: shouldAnimate ? 0.8 : 0 }}
                  >
                    <div className="bg-muted/30 rounded-lg p-4 h-full">
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary">
                        <Lightbulb className="h-4 w-4" />
                        Explicación
                      </div>

                      {currentQuestion.explanation ? (
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          <MarkdownContent>{currentQuestion.explanation}</MarkdownContent>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                          <Info className="h-4 w-4" />
                          No hay explicación disponible.
                        </div>
                      )}
                    </div>

                    {wasIncorrect && (
                      <motion.div
                        className="lg:col-span-1 flex flex-col gap-4 h-full"
                        initial={shouldAnimate ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: shouldAnimate ? 1.5 : 0 }}
                      >
                        <Button
                          variant={isAlreadyAdded ? 'subtle' : 'secondary'}
                          className="w-full min-h-12 mt-auto"
                          onClick={() => handleAddToReview(currentQuestion)}
                          disabled={isAlreadyAdded || isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Repeat className="mr-2 h-4 w-4" />
                          )}
                          {isAdding
                            ? 'Añadiendo...'
                            : isAlreadyAdded
                              ? 'Añadida a repetición espaciada'
                              : 'Añadir a repetición espaciada'}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="w-32"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              variant="default" // Changed from outline for better visibility of "Next" action
              className="w-32"
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* NAVIGATION SIDEBAR */}
        <TestSessionNavigation
          questions={questions}
          userAnswers={userAnswersMap}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionSelect={setCurrentQuestionIndex}
          defaultOpen={defaultOpenNavigation}
        />
      </Card>

      <ReportQuestionDialog
        questionId={currentQuestion.id}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </div>
  );
}
