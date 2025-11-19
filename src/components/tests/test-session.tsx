'use client';
import { submitTestAttempt } from '@/actions/tests';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { discardTestAttempt } from '@/actions/tests';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  CheckCircle,
  Eye,
  EyeClosed,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
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
  const [seeExplanation, setSeeExplanation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const containerRef = useRef<HTMLDivElement | null>(null);

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
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar al modo pantalla completa.',
      });
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
          title: 'Error al finalizar el test',
          description: result.error,
        });
      } else if (result?.success) {
        await queryClient.invalidateQueries({ queryKey: ['test-history-summary-rpc'] });
        resetTestStore();
        router.push('/dashboard/tests');
      }
    });
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

  return (
    <div ref={containerRef} className={isFullscreen ? 'w-screen h-screen bg-background' : ''}>
      <Card
        variant={'borderless'}
        className={
          isFullscreen
            ? 'w-full h-full m-0 rounded-none'
            : 'max-w-4xl mx-auto'
        }
      >
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle>Test en curso</CardTitle>
              <CardDescription>Responde a las siguientes preguntas.</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="mr-2 h-4 w-4" /> Salir pantalla completa
                  </>
                ) : (
                  <>
                    <Maximize2 className="mr-2 h-4 w-4" /> Pantalla completa
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="min-h-[300px]">
          <h3 className="text-lg font-semibold mb-6">{currentQuestion.text}</h3>

          <RadioGroup
            onValueChange={(value) => setUserAnswer(currentQuestion.id, value)}
            value={currentAnswer || ''}
            className="space-y-3"
          >
            {currentQuestion.answers.map((answer, index) => (
              <Label
                key={answer.id}
                htmlFor={answer.id}
                className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors has-checked:bg-primary/10 has-checked:border-primary"
              >
                <RadioGroupItem value={answer.id} id={answer.id} />
                <span className="font-semibold text-muted-foreground mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{answer.text}</span>
              </Label>
            ))}
          </RadioGroup>
          <Button
            className="mt-10 mx-auto"
            variant={'outline'}
            onClick={() => setSeeExplanation(!seeExplanation)}
          >
            {seeExplanation ? <EyeClosed /> : <Eye />}
            {seeExplanation ? 'Ocultar explicacion' : ' Ver explicación'}
          </Button>

          {seeExplanation && (
            <Alert variant={'success'} className="mt-6">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Explicación</AlertTitle>
              <AlertDescription>{currentQuestion.explanation}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
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
                setSeeExplanation(false);
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
    </div>
  );
}
