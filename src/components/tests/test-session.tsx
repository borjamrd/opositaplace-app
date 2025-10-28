'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { submitTestAttempt } from '@/actions/tests';
import type { Tables } from '@/lib/supabase/database.types';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
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
import { QuestionWithAnswers } from '@/lib/supabase/types';

const formSchema = z.object({
  answers: z.record(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface TestSessionProps {
  testAttempt: Tables<'test_attempts'>;
  questions: QuestionWithAnswers[];
}

export function TestSession({ testAttempt, questions }: TestSessionProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {},
    },
  });

  const { control, watch, handleSubmit } = form;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const watchedAnswers = watch('answers');

  const handleFinishTest = (data: FormData) => {
    startTransition(async () => {
      const result = await submitTestAttempt(testAttempt.id, data.answers);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error al finalizar el test',
          description: result.error,
        });
      }
    });
    setIsFinished(true); 
  };

  if (isFinished) {
    return <TestResults questions={questions} userAnswers={watchedAnswers} />;
  }

  return (
    <Card variant={'borderless'} className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test en curso</CardTitle>
        <CardDescription>Responde a las siguientes preguntas.</CardDescription>
        <div className="pt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
      </CardHeader>

      <CardContent className="min-h-[300px]">
        <h3 className="text-lg font-semibold mb-6">{currentQuestion.text}</h3>
        <Controller
          name={`answers.${currentQuestion.id}`}
          control={control}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3">
              {currentQuestion.answers.map((answer) => (
                <Label
                  key={answer.id}
                  htmlFor={answer.id}
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                >
                  <RadioGroupItem value={answer.id} id={answer.id} />
                  <span>{answer.text}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={!watchedAnswers[currentQuestion.id]}
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
                <AlertDialogAction onClick={handleSubmit(handleFinishTest)} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sí, finalizar y corregir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
