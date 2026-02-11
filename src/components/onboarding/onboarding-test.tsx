'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Trophy } from 'lucide-react';
import { TestResults } from '@/components/tests/test-results';
import { QuestionWithAnswers, TestAttempt } from '@/lib/supabase/types';

interface OnboardingTestStepProps {
  onComplete: () => void;
}

// Mock Data
const MOCK_QUESTIONS: QuestionWithAnswers[] = [
  {
    id: 'mock-q1',
    text: '¿Cuál es la norma suprema del ordenamiento jurídico español?',
    explanation:
      'La Constitución es la norma suprema del ordenamiento jurídico español, a la que están sujetos todos los poderes públicos y los ciudadanos.',
    topic_id: 'mock-topic-1',
    exam_id: 'mock-exam-id',
    opposition_id: 'mock-opposition-id',
    is_archived: false,
    reference_url: 'https://www.boe.es/constitución',
    created_at: new Date().toISOString(),
    answers: [
      { id: 'a1-1', question_id: 'mock-q1', text: 'El Código Civil', is_correct: false },
      { id: 'a1-2', question_id: 'mock-q1', text: 'La Constitución Española', is_correct: true },
      { id: 'a1-3', question_id: 'mock-q1', text: 'Las Leyes Orgánicas', is_correct: false },
      { id: 'a1-4', question_id: 'mock-q1', text: 'Los Reales Decretos', is_correct: false },
    ],
  },
  {
    id: 'mock-q2',
    text: '¿Quién sanciona las leyes aprobadas por las Cortes Generales?',
    explanation:
      'Corresponde al Rey sancionar y promulgar las leyes, según el artículo 62 de la Constitución.',
    topic_id: 'mock-topic-1',
    exam_id: 'mock-exam-id',
    opposition_id: 'mock-opposition-id',
    is_archived: false,
    reference_url: 'https://www.boe.es/constitución',
    created_at: new Date().toISOString(),
    answers: [
      { id: 'a2-1', question_id: 'mock-q2', text: 'El Presidente del Gobierno', is_correct: false },
      { id: 'a2-2', question_id: 'mock-q2', text: 'El Presidente del Congreso', is_correct: false },
      { id: 'a2-3', question_id: 'mock-q2', text: 'El Rey', is_correct: true },
      { id: 'a2-4', question_id: 'mock-q2', text: 'El Ministro de Justicia', is_correct: false },
    ],
  },
];

export default function OnboardingTestStep({ onComplete }: OnboardingTestStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100;

  const handleAnswer = (answerId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center pt-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Descubre Opositaplace</h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          A continuación verás ejemplos de cómo funciona nuestra plataforma. Responde a unas breves
          preguntas para familiarizarte con el entorno de examen.
        </p>

        <Card className="text-left mt-8 border-l-4 border-l-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">¿Qué encontrarás?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span>Preguntas actualizadas y explicadas.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span>Interfaz similar al examen real.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span>Resultados detallados al instante.</span>
            </div>
          </CardContent>
        </Card>

        <div className="pt-6">
          <Button
            onClick={() => setHasStarted(true)}
            size="lg"
            className="w-full md:w-auto px-8 py-6 text-lg"
          >
            Comencemos <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    // Calcular resultado mock
    const correctCount = MOCK_QUESTIONS.reduce((acc, q) => {
      const userAnswer = userAnswers[q.id];
      const correctAnswer = q.answers.find((a) => a.is_correct);
      return userAnswer === correctAnswer?.id ? acc + 1 : acc;
    }, 0);

    const mockAttempt: TestAttempt = {
      id: 'mock-attempt',
      user_id: 'mock-user',
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      opposition_id: 'mock-opposition-id',
      status: 'completed',
      study_cycle_id: 'mock-study-cycle-id',
      timer_enabled: false,
      title: 'Test de Prueba',
      score: (correctCount / MOCK_QUESTIONS.length) * 10,
      correct_answers: correctCount,
      incorrect_answers: MOCK_QUESTIONS.length - correctCount,
      unanswered_questions: 0,
      completed_at: new Date().toISOString(),
      duration_seconds: 120,
      mode: 'mock',
      total_questions: MOCK_QUESTIONS.length,
      net_score: correctCount - (MOCK_QUESTIONS.length - correctCount) / 3, // Simple penalty
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">¡Test Completado!</h2>
          <p className="text-muted-foreground">
            Has completado tu primer test de prueba. Aquí tienes tus resultados.
          </p>
        </div>

        <TestResults
          questions={MOCK_QUESTIONS}
          userAnswers={userAnswers}
          attempt={mockAttempt}
          addedCardIds={[]}
        />

        <div className="flex justify-center pt-6">
          <Button onClick={onComplete} size="lg" className="w-full md:w-auto min-w-[200px]">
            Continuar con el Plan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>Test de Prueba</CardTitle>
            <span className="text-sm text-muted-foreground font-mono">
              {currentQuestionIndex + 1} / {MOCK_QUESTIONS.length}
            </span>
          </div>
          <CardDescription>
            Responde estas preguntas sencillas para probar la interfaz de examen.
          </CardDescription>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">{currentQuestion.text}</h3>

            <RadioGroup
              onValueChange={handleAnswer}
              value={userAnswers[currentQuestion.id] || ''}
              className="space-y-3"
            >
              {currentQuestion.answers.map((answer, index) => (
                <Label
                  key={answer.id}
                  htmlFor={answer.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
                    userAnswers[currentQuestion.id] === answer.id
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-card'
                  }`}
                >
                  <RadioGroupItem value={answer.id} id={answer.id} />
                  <span className="font-semibold text-muted-foreground w-6 h-6 flex items-center justify-center border rounded-full text-xs shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="leading-snug">{answer.text}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleNext} disabled={!userAnswers[currentQuestion.id]}>
            {currentQuestionIndex < MOCK_QUESTIONS.length - 1 ? (
              <>
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Ver Resultados <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
