'use client';

import { submitOnboarding } from '@/actions/onboarding';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getActiveOppositions } from '@/lib/supabase/queries/getActiveOppositions';
import { useStudySessionStore } from '@/store/study-session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BookText,
  Calendar,
  ChevronRight,
  Flag,
  GraduationCap,
  Loader2,
  RotateCw,
  Save,
  Star,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Opposition } from '@/lib/supabase/types';
import { useProfileStore } from '@/store/profile-store';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Importar los nuevos componentes de paso
// import OnboardingEvaluationStep from './onboarding-evaluation-step';
import OnboardingCycleStep from './onboarding-cycle-step';
import OnboardingObjectivesStep from './onboarding-objectives-step';
import OnboardingOppositionStep from './onboarding-opposition-step';

import OnboardingStepPracticalCase from './onboarding-step-practical-case';
import OnboardingSubscriptionStep from './onboarding-subscription-step';
import OnboardingTestStep from './onboarding-test';
import OnboardingTopicsStep from './onboarding-topics-step';

// El esquema Zod y el estado de la acción permanecen en el padre
const onboardingFormSchema = z.object({
  opposition_scope: z
    .string({ required_error: 'Debes seleccionar un ámbito.' })
    .min(1, 'Debes seleccionar un ámbito.'),
  opposition_id: z
    .string({ required_error: 'Debes seleccionar una oposición.' })
    .uuid({ message: 'ID de oposición inválido.' })
    .min(1, 'Debes seleccionar una oposición.'),
  weekly_study_goal_hours: z.coerce
    .number({ required_error: 'Define un objetivo de horas.' })
    .int()
    .min(1, 'El objetivo debe ser de al menos 1 hora.')
    .max(100, 'El objetivo no puede superar las 100 horas.'),

  cycle_number: z.coerce
    .number()
    .int()
    .min(1, 'El número de vuelta debe ser al menos 1.')
    .default(1),
  selected_topics: z.array(z.string()).default([]),
  selected_plan: z.enum(['free', 'trial']).default('trial'),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

const initialActionState: { message: string; errors: any; success: boolean } = {
  message: '',
  errors: null,
  success: false,
};

const steps = [
  {
    id: 'step-1-opposition',
    name: 'Oposición',
    description: 'Escoge entre las opciones disponibles',
    icon: Flag,
    fields: ['opposition_scope', 'opposition_id'] as const,
  },
  {
    id: 'step-3-goal',
    name: 'Objetivo semanal',
    description: '¿Cuántas horas quieres dedicar a la semana?',
    icon: Calendar,
    fields: ['weekly_study_goal_hours'] as const,
  },

  {
    id: 'step-5-cycle',
    name: 'Ciclo de estudio',
    description: '¿En qué vuelta estás?',
    icon: RotateCw,
    fields: ['cycle_number'] as const,
  },
  {
    id: 'step-6-topics',
    name: 'Temario',
    description: 'Marca tu progreso',
    icon: BookOpen,
    fields: ['selected_topics'] as const,
  },
  {
    id: 'step-7-test',
    name: '',
    description: '',
    icon: GraduationCap,
    fields: [] as const,
  },
  {
    id: 'step-8-practical-cases',
    name: '',
    description: '',
    icon: BookText,
    fields: [] as const,
  },
  {
    id: 'step-9-plan',
    name: 'Tu plan',
    description: 'Elige tu suscripción',
    icon: Star,
    fields: ['selected_plan'] as const,
  },
];

const StepAnimationWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function OnboardingForm() {
  const params = useParams();
  const { toast } = useToast();
  const pageUserId = params.userId as string;

  const queryClient = useQueryClient();
  const router = useRouter();

  const [actionState, formAction] = useActionState(submitOnboarding, initialActionState);
  const [oppositions, setOppositions] = useState<Opposition[]>([]);
  const [isLoadingOppositions, setIsLoadingOppositions] = useState(true);
  const { profile } = useProfileStore();

  const { selectOpposition } = useStudySessionStore();
  const [isServerActionPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isPracticalCaseFinished, setIsPracticalCaseFinished] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      opposition_scope: undefined,
      opposition_id: undefined,
      weekly_study_goal_hours: 20,
      cycle_number: 1,
      selected_topics: [],
      selected_plan: 'trial',
    },
  });

  // --- Carga de datos inicial ---
  useEffect(() => {
    async function loadOppositions() {
      setIsLoadingOppositions(true);
      const fetchedOppositions = await getActiveOppositions();
      setOppositions(fetchedOppositions);
      setIsLoadingOppositions(false);
    }
    loadOppositions();
  }, []);

  useEffect(() => {
    if (actionState.success) {
      const handleSuccess = async () => {
        await queryClient.invalidateQueries();
        router.refresh();
      };
      handleSuccess();
    } else if (actionState.message && !actionState.success) {
      toast({
        title: 'Error',
        description: actionState.message,
        variant: 'destructive',
      });
    }
  }, [actionState, router, queryClient, toast]);

  // (useEffect para actionState success...)
  useEffect(() => {
    if (actionState.message) {
      toast({
        title: actionState.success ? 'Onboarding Completado' : 'Error en Onboarding',
        description: actionState.message,
        variant: actionState.success ? 'default' : 'destructive',
      });
    }
    if (actionState.success) {
      const finalOppositionId = form.getValues('opposition_id');
      if (finalOppositionId) {
        const finalSelectedOp = oppositions.find((op) => op.id === finalOppositionId);
        if (finalSelectedOp) {
          selectOpposition(finalSelectedOp.id);
        }
      }
    }
  }, [actionState, toast, selectOpposition, form, oppositions]);

  const handleNextStep = async () => {
    const currentStepFields = steps[currentStep].fields;
    const result = await form.trigger(currentStepFields);

    if (result) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        form.handleSubmit(handleFinalSubmit)();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = (data: OnboardingFormValues) => {
    if (currentStep !== steps.length - 1) {
      return;
    }
    if (!profile) {
      toast({ title: 'Error', description: 'Usuario no autenticado.', variant: 'destructive' });
      return;
    }
    if (profile.id !== pageUserId) {
      toast({
        title: 'Error de Seguridad',
        description: 'Discrepancia de ID de usuario.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      formData.append('user_id', profile.id);
      formData.append('opposition_id', data.opposition_id);
      formData.append('weekly_study_goal_hours', data.weekly_study_goal_hours.toString());
      formData.append('cycle_number', data.cycle_number.toString());
      formData.append('selected_topics', JSON.stringify(data.selected_topics));
      formData.append('selected_plan', data.selected_plan);

      formAction(formData);
    });
  };

  // --- Renderizado ---
  if (!profile || isLoadingOppositions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] p-4 items-center justify-center">
      <div className="flex w-full max-w-7xl mx-auto items-start md:items-center gap-4 md:gap-8">
        {/* Left Button (Prev) */}
        <div className="hidden md:flex shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className={`h-16 w-16 rounded-full border-2 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
        </div>

        <div className="flex flex-col w-full grow p-4 md:p-8 bg-background/80 backdrop-blur-sm rounded-xl">
          {/* --- Pasos Superiores --- */}

          <main className="w-full">
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="h-full"
              >
                <Card className="flex flex-col h-full bg-transparent border-0 shadow-none">
                  <CardHeader className="flex flex-col items-center justify-center pt-8">
                    <CardTitle className="text-3xl font-bold text-primary">
                      {steps[currentStep].name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {steps[currentStep].description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grow space-y-8">
                    {actionState?.message && !actionState.success && !actionState.errors && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{actionState.message}</AlertDescription>
                      </Alert>
                    )}
                    {actionState?.errors && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {typeof actionState.errors === 'string' ? (
                            actionState.errors
                          ) : (
                            <ul className="list-disc pl-4 mt-2">
                              {Object.entries(actionState.errors).map(
                                ([key, messages]: [string, any]) =>
                                  Array.isArray(messages) ? (
                                    messages.map((msg: string, i: number) => (
                                      <li key={`${key}-${i}`}>{msg}</li>
                                    ))
                                  ) : (
                                    <li key={key}>{String(messages)}</li>
                                  )
                              )}
                            </ul>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Renderizado de Pasos */}
                    {currentStep === 0 && (
                      <StepAnimationWrapper>
                        <OnboardingOppositionStep
                          oppositions={oppositions}
                          isLoadingOppositions={isLoadingOppositions}
                        />
                      </StepAnimationWrapper>
                    )}
                    {/* {currentStep === 1 && <OnboardingEvaluationStep />} */}
                    {currentStep === 1 && (
                      <StepAnimationWrapper>
                        <OnboardingObjectivesStep />
                      </StepAnimationWrapper>
                    )}
                    {currentStep === 2 && (
                      <StepAnimationWrapper>
                        <OnboardingCycleStep
                          selectedCycle={form.watch('cycle_number')}
                          onSelectCycle={(cycle) => form.setValue('cycle_number', cycle)}
                        />
                      </StepAnimationWrapper>
                    )}
                    {currentStep === 3 && (
                      <StepAnimationWrapper>
                        <OnboardingTopicsStep
                          oppositionId={form.watch('opposition_id')}
                          selectedTopics={form.watch('selected_topics')}
                          onSelectTopics={(topics) => form.setValue('selected_topics', topics)}
                        />
                      </StepAnimationWrapper>
                    )}
                    {currentStep === 4 && (
                      <StepAnimationWrapper>
                        <OnboardingTestStep onTestFinished={() => setIsTestFinished(true)} />
                      </StepAnimationWrapper>
                    )}
                    {currentStep === 5 && (
                      <StepAnimationWrapper>
                        <OnboardingStepPracticalCase
                          onCaseFinished={() => setIsPracticalCaseFinished(true)}
                        />
                      </StepAnimationWrapper>
                    )}
                    {currentStep === 6 && (
                      <StepAnimationWrapper>
                        <OnboardingSubscriptionStep
                          selectedPlan={form.watch('selected_plan')}
                          onSelectPlan={(plan) => form.setValue('selected_plan', plan)}
                        />
                      </StepAnimationWrapper>
                    )}
                  </CardContent>
                </Card>
              </form>
            </Form>
          </main>

          {/* Right Button (Next) */}
        </div>
        <div className="hidden md:flex shrink-0">
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                (steps[currentStep].id === 'step-7-test' && !isTestFinished) ||
                (steps[currentStep].id === 'step-8-practical-cases' && !isPracticalCaseFinished)
              }
              className="h-16 w-16 rounded-full shadow-lg"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isServerActionPending}
              className="h-16 w-16 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
            >
              {isServerActionPending ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Save className="h-8 w-8" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
