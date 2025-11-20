'use client';
import { discardTestAttempt, submitTestAttempt } from '@/actions/tests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/lib/supabase/database.types';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { useTestStore } from '@/store/test-store';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle,
  LayoutTemplate,
  LibraryBig,
  Loader2,
  Maximize,
  Minimize,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { TestResults } from './test-results';

interface TestSessionProps {
  testAttempt: Tables<'test_attempts'>;
  questions: QuestionWithAnswers[];
}

export function TestSession({ testAttempt, questions }: TestSessionProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFinished, setIsFinished] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    test,
    userAnswers,
    currentQuestionIndex,
    setTest,
    setUserAnswer,
    setCurrentQuestionIndex,
    reset: resetTestStore,
  } = useTestStore();

  useEffect(() => {
    if (!test || test.id !== testAttempt.id) {
      const allAnswers = questions.flatMap((q) => q.answers);
      setTest(testAttempt, questions, allAnswers);
    }
  }, [test, testAttempt, questions, setTest]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentAnswer = userAnswers.get(currentQuestion?.id);

  const handleFinishTest = () => {
    startTransition(async () => {
      const answersObject = Object.fromEntries(userAnswers);
      const result = await submitTestAttempt(testAttempt.id, answersObject);

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error al finalizar',
          description: result.error,
        });
      } else if (result?.success) {
        if (document.fullscreenElement) document.exitFullscreen();
        await queryClient.invalidateQueries({ queryKey: ['test-history-summary-rpc'] });
        resetTestStore();
        router.push(`/dashboard/tests/${testAttempt.id}`);
      }
    });
  };

  const handleDiscard = () => {
    startTransition(async () => {
      try {
        const res = await discardTestAttempt(testAttempt.id);
        if (res.success) {
          if (document.fullscreenElement) document.exitFullscreen();
          resetTestStore();
          toast({ title: 'Test descartado', description: 'El intento ha sido eliminado.' });
          router.push('/dashboard/tests');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo descartar el test.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSaveAndExit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    toast({ title: 'Test pausado', description: 'Puedes retomarlo desde el historial.' });
    router.push('/dashboard/tests');
  };

  if (isFinished) {
    const answersObject = Object.fromEntries(userAnswers);
    return <TestResults questions={questions} userAnswers={answersObject} addedCardIds={[]} />;
  }

  if (!currentQuestion) {
    return (
      <Card
        variant={'borderless'}
        className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  // Casteamos el topic para acceder a propiedades anidadas si existen en tu tipo QuestionWithAnswers
  // Ajusta 'any' al tipo real si lo tienes definido en types.ts
  const topicData = (currentQuestion as any).topic;
  const blockName = topicData?.block?.name;
  const topicName = topicData?.name;
  const examName = (currentQuestion as any).exam?.name;

  return (
    <div
      ref={containerRef}
      className={`bg-background transition-all ${isFullscreen ? 'p-4 md:p-8 h-screen overflow-y-auto flex flex-col' : ''}`}
    >
      <div className="max-w-4xl mx-auto w-full mb-4 flex items-center justify-between">
        {!isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitDialog(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="mr-2 h-4 w-4" /> Salir
          </Button>
        )}

        <Button variant="outline" size="sm" className="ml-auto" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <>
              {' '}
              <Minimize className="mr-2 h-4 w-4" /> Salir de pantalla completa{' '}
            </>
          ) : (
            <>
              {' '}
              <Maximize className="mr-2 h-4 w-4" /> Pantalla completa{' '}
            </>
          )}
        </Button>
      </div>

      <Card
        variant={isFullscreen ? 'default' : 'borderless'}
        className="max-w-4xl mx-auto w-full flex-1"
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Test en curso</CardTitle>
            </div>

            {/* BADGES DE TEMA Y BLOQUE */}
            {(topicName || blockName || examName) && (
              <div className="flex flex-col items-end gap-1">
                {examName && (
                  <Badge variant="secondary" className="text-xs text-muted-foreground font-normal">
                    <BookOpenCheck className="mr-1 h-3 w-3" /> {examName}
                  </Badge>
                )}
                {blockName && (
                  <Badge variant="secondary" className="text-xs text-muted-foreground font-normal">
                    <LibraryBig className="mr-1 h-3 w-3" /> {blockName}
                  </Badge>
                )}
                {topicName && (
                  <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                    <LayoutTemplate className="mr-1 h-3 w-3" /> {topicName}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="min-h-[300px]">
          <h3 className="text-lg font-semibold mb-6 leading-relaxed">{currentQuestion.text}</h3>

          <RadioGroup
            onValueChange={(value) => setUserAnswer(currentQuestion.id, value)}
            value={currentAnswer || ''}
            className="space-y-3"
          >
            {currentQuestion.answers.map((answer, index) => (
              <Label
                key={answer.id}
                htmlFor={answer.id}
                className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-all 
                  hover:bg-accent/50 
                  ${currentAnswer === answer.id ? 'bg-primary/5 border-primary shadow-sm' : ''}
                `}
              >
                <RadioGroupItem value={answer.id} id={answer.id} />
                <span className="font-semibold text-muted-foreground mr-2 shrink-0">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{answer.text}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              }}
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Test
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Una vez finalizado, el test se corregirá y no podrás cambiar tus respuestas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinishTest} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sí, finalizar y corregir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas salir del test?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes un test en curso. Puedes guardarlo para continuar luego, o descartarlo
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between gap-2">
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={isPending}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Descartar intento
            </Button>

            <div className="flex gap-2 justify-end w-full sm:w-auto">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button onClick={handleSaveAndExit}>
                <Save className="h-4 w-4 mr-2" /> Guardar y Salir
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
