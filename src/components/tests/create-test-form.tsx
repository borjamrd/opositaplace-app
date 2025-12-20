// src/components/tests/create-test-form.tsx
'use client';

import { checkTestCreationEligibility, createTestAttempt } from '@/actions/tests';
import { LimitReachedModal } from '@/components/subscription/limit-reached-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { BlockWithTopics } from '@/lib/supabase/types';
import { useStudySessionStore } from '@/store/study-session-store';
import { Clock, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

type Exam = { id: string; name: string };

type ExerciseType = 'test' | 'practical' | 'oral' | 'physical' | 'language' | 'psychotechnical';
type Exercise = {
  id: string;
  name: string;
  type: ExerciseType;
  duration_minutes?: number;
  question_count?: number;
};
type OppositionMetadata = {
  exercises: Exercise[];
};

interface IFormInput {
  mode: 'random' | 'errors' | 'topics' | 'exams' | 'mock';
  topicIds: string[];
  examIds: string[];
  numQuestions: number;
  timerEnabled: boolean;
  includeNoTopic: boolean;
  duration?: number;
}

export function CreateTestForm({
  blocksWithTopics,
  oppositionId,
  setIsOpen,
  exams,
  oppositionMetadata,
}: {
  blocksWithTopics: BlockWithTopics[];
  oppositionId: string;
  setIsOpen: () => void;
  exams?: Exam[];
  oppositionMetadata?: OppositionMetadata | null;
}) {
  const { control, handleSubmit, watch, setValue } = useForm<IFormInput>({
    defaultValues: {
      mode: 'random',
      numQuestions: 25,
      timerEnabled: true,
      topicIds: [],
      examIds: [],
      includeNoTopic: true,
    },
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [numQuestions, setNumQuestionsState] = useState(25);

  const [mockDuration, setMockDuration] = useState<number | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [nextTestDate, setNextTestDate] = useState<Date | null>(null);

  const activeStudyCycle = useStudySessionStore((state) => state.activeStudyCycle);
  const mode = watch('mode');
  const selectedTopics = watch('topicIds');
  const selectedExams = watch('examIds');

  const configureMockMode = () => {
    const testConfig = oppositionMetadata?.exercises?.find((e) => e.type === 'test');
    const officialQuestions = testConfig?.question_count || 105;
    const officialDuration = testConfig?.duration_minutes || 90;

    setNumQuestionsState(officialQuestions);
    setMockDuration(officialDuration);

    setValue('timerEnabled', true);
    setValue('duration', officialDuration);
  };

  const onSubmit = (data: IFormInput) => {
    if (!activeStudyCycle) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se ha encontrado un ciclo de estudio activo.',
      });
      return;
    }
    if (data.mode === 'topics' && data.topicIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar al menos un tema.',
      });
      return;
    }
    if (data.mode === 'exams' && data.examIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar al menos un examen.',
      });
      return;
    }

    startTransition(async () => {
      // Verificar elegibilidad antes de crear el test
      const eligibility = await checkTestCreationEligibility();

      if (!eligibility.allowed) {
        if (eligibility.reason === 'limit_reached' && eligibility.nextTestDate) {
          setNextTestDate(new Date(eligibility.nextTestDate));
          setShowLimitModal(true);
          return;
        }
        // Otros errores
        toast({
          variant: 'destructive',
          title: 'Error',
          description: eligibility.error || 'No puedes crear un test en este momento.',
        });
        return;
      }

      const result = await createTestAttempt({
        ...data,
        numQuestions: data.mode === 'mock' ? numQuestions : data.numQuestions,
        oppositionId,
        studyCycleId: activeStudyCycle.id,
      });
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error al crear el test',
          description: result.error,
        });
      } else {
        setIsOpen();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        nextTestDate={nextTestDate}
      />
      <Card variant={'borderless'} className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Configura tu test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label className="text-lg font-semibold">1. Elige un modo</Label>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(v) => {
                    field.onChange(v);

                    setMockDuration(null);

                    if (v === 'mock') {
                      configureMockMode();
                    } else {
                      setNumQuestionsState(25);
                    }
                  }}
                  value={field.value}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="r1" />
                    <Label htmlFor="r1">Test aleatorio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="errors" id="r2" />
                    <Label htmlFor="r2">Repaso de errores</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="topics" id="r3" />
                    <Label htmlFor="r3">Test por temas</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mock" id="r5" />
                    <Label htmlFor="r5" className="flex items-center gap-2">
                      Simulacro de examen
                      {oppositionMetadata?.exercises?.some((e) => e.type === 'test') && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Oficial
                        </span>
                      )}
                    </Label>
                  </div>

                  {exams && exams.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exams" id="r4" />
                      <Label htmlFor="r4">Exámenes anteriores (Práctica libre)</Label>
                    </div>
                  )}
                </RadioGroup>
              )}
            />
          </div>

          {mode === 'topics' && (
            <div>
              <Label className="text-lg font-semibold">2. Selecciona los temas</Label>
              <div className="space-y-4 mt-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {blocksWithTopics.map((block) => (
                  <div key={block.id}>
                    <h4 className="font-medium mb-2">{block.name}</h4>
                    <div className="space-y-1 pl-4">
                      {block.topics.map((topic) => (
                        <div key={topic.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={topic.id}
                            checked={!!selectedTopics?.includes(topic.id)}
                            onCheckedChange={(checked) => {
                              const isChecked = Boolean(checked);
                              const currentIds = selectedTopics || [];
                              const newIds = isChecked
                                ? [...currentIds, topic.id]
                                : currentIds.filter((id) => id !== topic.id);
                              setValue('topicIds', newIds);
                            }}
                          />
                          <Label htmlFor={topic.id} className="font-normal">
                            {topic.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'exams' && exams && (
            <div>
              <Label className="text-lg font-semibold">2. Selecciona los exámenes</Label>
              <div className="space-y-4 mt-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={exam.id}
                      checked={!!selectedExams?.includes(exam.id)}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        const currentIds = selectedExams || [];
                        const newIds = isChecked
                          ? [...currentIds, exam.id]
                          : currentIds.filter((id) => id !== exam.id);
                        setValue('examIds', newIds);
                      }}
                    />
                    <Label htmlFor={exam.id} className="font-normal">
                      {exam.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                3. Número de preguntas: <strong>{numQuestions}</strong>
              </Label>

              {mode === 'mock' && (
                <div className="flex items-center text-muted-foreground text-sm gap-2">
                  {mockDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {mockDuration} min
                    </span>
                  )}
                  <span className="text-xs bg-muted px-2 py-1 rounded">Modo Simulación</span>
                </div>
              )}
            </div>

            <Slider
              disabled={mode === 'mock'}
              value={[numQuestions]}
              max={mode === 'exams' ? 150 : 100}
              min={5}
              step={5}
              className="mt-3"
              onValueChange={(v) => {
                setNumQuestionsState(v[0]);
                setValue('numQuestions', v[0]);
              }}
            />

            {mode === 'mock' && (
              <p className="text-xs text-muted-foreground mt-2">
                * En el modo simulacro, el número de preguntas y el tiempo están fijados según la
                estructura oficial de la oposición.
              </p>
            )}

            {mode === 'exams' && (
              <p className="text-xs text-muted-foreground mt-2">
                * Selecciona cuántas preguntas quieres repasar de los exámenes elegidos.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Creando test...' : 'Comenzar test'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
