'use client';

import { submitOnboarding } from '@/actions/onboarding';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getActiveOppositions } from '@/lib/supabase/queries/getActiveOppositions';
import { useStudySessionStore } from '@/store/study-session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Flag,
  Loader2,
  Rocket,
  Save,
  Target
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  DAYS_OF_WEEK_ORDERED,
  SLOT_DURATION_OPTIONS,
  generateTimeSlots,
} from '@/components/weekly-planner/constants';
import SelectedSlotsSummary from '@/components/weekly-planner/SelectedSlotsSummary';
import SlotDurationSelector from '@/components/weekly-planner/SlotDurationSelector';
import { Day, SelectedSlots } from '@/components/weekly-planner/types';
import WeeklyPlanner from '@/components/weekly-planner/WeeklyPlanner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { initializeSelectedSlots, parseSlotToMinutes } from '@/components/weekly-planner/utils';
import { Opposition } from '@/lib/supabase/types';
import { useProfileStore } from '@/store/profile-store';
import { useQueryClient } from '@tanstack/react-query';

const helpOptions = [
  'Organización del estudio',
  'Técnicas de memorización',
  'Gestión del tiempo',
  'Realización de tests',
  'Manejo del estrés y ansiedad',
  'Motivación',
] as const;

// Esquema Zod actualizado para el nuevo flujo de 4 pasos
const onboardingFormSchema = z.object({
  opposition_id: z
    .string({ required_error: 'Debes seleccionar una oposición.' })
    .uuid({ message: 'ID de oposición inválido.' })
    .min(1, 'Debes seleccionar una oposición.'),
  baseline_assessment: z
    .string()
    .min(10, 'Describe tu punto de partida (mín. 10 caracteres)')
    .max(500, 'Máximo 500 caracteres'),
  help_with: z.array(z.string()).optional().default([]),
  weekly_study_goal_hours: z.coerce
    .number({ required_error: 'Define un objetivo de horas.' })
    .int()
    .min(1, 'El objetivo debe ser de al menos 1 hora.')
    .max(100, 'El objetivo no puede superar las 100 horas.'),
  study_days: z.record(z.nativeEnum(Day), z.record(z.string(), z.boolean())).refine(
    (data) => {
      return Object.values(data).some((daySlots) =>
        Object.values(daySlots).some((isSelected) => isSelected)
      );
    },
    {
      message: 'Debes seleccionar al menos una franja horaria de estudio.',
      path: ['study_days'],
    }
  ),
  slot_duration_minutes: z.coerce
    .number({
      required_error: 'La duración de los slots es requerida.',
      invalid_type_error: 'Debe ser un número entero.',
    })
    .int('La duración debe ser un número entero.')
    .positive('La duración debe ser un número positivo.')
    .refine((val) => SLOT_DURATION_OPTIONS.includes(val), {
      message: 'La duración del slot no es una opción válida.',
    }),
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
    description: 'Selecciona tu objetivo',
    icon: Flag,
    fields: ['opposition_id'] as const,
  },
  {
    id: 'step-2-baseline',
    name: 'Autoevaluación',
    description: 'Conócete a ti mismo',
    icon: Target,
    fields: ['baseline_assessment', 'help_with'] as const,
  },
  {
    id: 'step-3-goal',
    name: 'Objetivo Semanal',
    description: 'Define tu meta',
    icon: Calendar,
    fields: ['weekly_study_goal_hours'] as const,
  },
  {
    id: 'step-4-planner',
    name: 'Plan de Estudio',
    description: 'Crea tu horario',
    icon: Rocket,
    fields: ['study_days', 'slot_duration_minutes'] as const,
  },
];

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

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(0);

  // Estados para el planificador semanal
  const defaultDuration = SLOT_DURATION_OPTIONS.includes(60)
    ? 60
    : SLOT_DURATION_OPTIONS[Math.floor(SLOT_DURATION_OPTIONS.length / 2)];
  const [slotDuration, setSlotDuration] = useState<number>(defaultDuration);
  const [currentTimeSlots, setCurrentTimeSlots] = useState<string[]>(() =>
    generateTimeSlots(defaultDuration)
  );
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlots>(() =>
    initializeSelectedSlots(currentTimeSlots)
  );
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [totalSelectedHours, setTotalSelectedHours] = useState(0);

  // Inicialización del formulario
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      opposition_id: undefined,
      baseline_assessment: '', // Corregido
      help_with: [],
      weekly_study_goal_hours: 20,
      study_days: {},
      slot_duration_minutes: defaultDuration,
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
    // Se ejecuta solo si la acción del formulario terminó y fue exitosa
    if (actionState.success) {
      // Creamos una función async interna para poder usar await
      const handleSuccess = async () => {
        // Invalida la caché de React Query
        await queryClient.invalidateQueries();

        // Redirige al usuario
        router.refresh();
      };

      handleSuccess();
    } else if (actionState.message && !actionState.success) {
      // Maneja el error devuelto por la server action
      // (Solo se muestra si hay un mensaje de error y success es false)
      toast({
        title: 'Error',
        description: actionState.message,
        variant: 'destructive',
      });
    }

    // 'state' es la dependencia clave.
  }, [actionState]);

  // --- Efectos para el Planificador ---
  useEffect(() => {
    const newTimeSlots = generateTimeSlots(slotDuration);
    setCurrentTimeSlots(newTimeSlots);
    form.setValue('slot_duration_minutes', slotDuration, { shouldValidate: true });

    // Lógica para re-calcular slots seleccionados al cambiar duración
    setSelectedSlots((prevSelectedSlots) => {
      const newInitializedSlots = initializeSelectedSlots(newTimeSlots);
      DAYS_OF_WEEK_ORDERED.forEach((day) => {
        if (!prevSelectedSlots || !prevSelectedSlots[day]) return;
        newTimeSlots.forEach((newSlotString) => {
          const newSlotTimes = parseSlotToMinutes(newSlotString);
          if (!newSlotTimes) return;
          let newSlotShouldBeSelected = false;
          for (const oldSlotString in prevSelectedSlots[day]) {
            if (prevSelectedSlots[day][oldSlotString]) {
              const oldSlotTimes = parseSlotToMinutes(oldSlotString);
              if (!oldSlotTimes) continue;
              const oldContainedInNew =
                oldSlotTimes.startMinutes >= newSlotTimes.startMinutes &&
                oldSlotTimes.endMinutes <= newSlotTimes.endMinutes;
              const newContainedInOld =
                newSlotTimes.startMinutes >= oldSlotTimes.startMinutes &&
                newSlotTimes.endMinutes <= oldSlotTimes.endMinutes;
              if (oldContainedInNew || newContainedInOld) {
                newSlotShouldBeSelected = true;
                break;
              }
            }
          }
          if (newSlotShouldBeSelected && newInitializedSlots[day]) {
            newInitializedSlots[day][newSlotString] = true;
          }
        });
      });
      return newInitializedSlots;
    });
  }, [slotDuration, form]);

  useEffect(() => {
    form.setValue('study_days', selectedSlots, { shouldValidate: true });

    // Calcular horas totales para la barra de progreso
    let totalMinutes = 0;
    Object.values(selectedSlots).forEach((daySlots) => {
      Object.values(daySlots).forEach((isSelected) => {
        if (isSelected) {
          totalMinutes += slotDuration;
        }
      });
    });
    setTotalSelectedHours(totalMinutes / 60);
  }, [selectedSlots, form, slotDuration]);

  // --- Efecto para manejar respuesta de la Server Action ---
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

  // --- Handlers para el Planificador ---
  const handleToggleSlot = useCallback((day: Day, timeSlot: string) => {
    setSelectedSlots((prev) => {
      const currentDaySlots = prev[day] || {};
      const wasSelected = currentDaySlots[timeSlot];
      if (typeof wasSelected === 'undefined') return prev;
      const newDaySlots = { ...currentDaySlots };
      newDaySlots[timeSlot] = !newDaySlots[timeSlot];
      return { ...prev, [day]: newDaySlots };
    });
  }, []);

  const handleDurationChange = useCallback((newDuration: number) => {
    setSlotDuration(newDuration);
  }, []);

  // --- Handlers de Navegación de Pasos ---
  const handleNextStep = async () => {
    const currentStepFields = steps[currentStep].fields;
    const result = await form.trigger(currentStepFields);

    if (result) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // --- Handler de Envío Final ---
  const handleFinalSubmit = (data: OnboardingFormValues) => {
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

    const hasAnySlotSelected = Object.values(selectedSlots).some((daySlots) =>
      Object.values(daySlots).some((isSelected) => isSelected)
    );
    if (!hasAnySlotSelected) {
      form.setError('study_days', {
        type: 'manual',
        message: 'Debes seleccionar al menos una franja horaria de estudio.',
      });
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      formData.append('user_id', profile.id);
      formData.append('opposition_id', data.opposition_id);
      // Corregido: Enviar 'baseline_assessment' como JSON
      formData.append(
        'baseline_assessment',
        JSON.stringify({ main_challenge: data.baseline_assessment })
      );
      formData.append('weekly_study_goal_hours', data.weekly_study_goal_hours.toString());
      formData.append('help_with', JSON.stringify(data.help_with || []));
      formData.append('study_days', JSON.stringify(selectedSlots));
      formData.append('slot_duration_minutes', data.slot_duration_minutes.toString());

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

  const weeklyGoalHours = form.watch('weekly_study_goal_hours');
  const progressPercentage = weeklyGoalHours > 0 ? (totalSelectedHours / weeklyGoalHours) * 100 : 0;

  return (
    <div className="flex min-h-[calc(100vh-10rem)]">
      <div className="flex w-full max-w-6xl mt-10 mx-auto p-4 md:p-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-xl border">
        {/* --- Sidebar de Pasos (Estilo visual del ejemplo) --- */}
        <nav className="hidden md:flex md:w-1/3 lg:w-1/4 p-6 bg-gradient-to-b from-secondary/20 to-background rounded-l-lg">
          <ol className="relative space-y-8">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const StepIcon = step.icon;

              return (
                <li key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle className="h-6 w-6" />
                      </span>
                    ) : (
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isActive
                            ? 'bg-primary border-2 border-primary text-primary-foreground'
                            : 'bg-secondary border-2'
                        }`}
                      >
                        <StepIcon
                          className={`h-6 w-6 ${isActive ? '' : 'text-muted-foreground'}`}
                        />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-lg font-semibold ${
                        isActive ? 'text-primary' : isCompleted ? '' : 'text-muted-foreground'
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* --- Contenido Principal del Formulario --- */}
        <main className="w-full md:w-2/3 lg:w-3/4 md:pl-10 lg:pl-16">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="h-full">
              <Card className="flex flex-col h-full bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Paso {currentStep + 1}: {steps[currentStep].name}
                  </CardTitle>
                  <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow space-y-8">
                  {/* --- Errores Globales de la Action --- */}
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
                      <AlertTitle>Error de validación</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2">
                          {Object.entries(actionState.errors).map(
                            ([field, fieldErrors]: [string, any]) =>
                              Array.isArray(fieldErrors) &&
                              fieldErrors.map((error: string, index: number) => (
                                <li key={`${field}-${index}`}>
                                  <strong>{field.replace('_', ' ')}:</strong> {error}
                                </li>
                              ))
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {currentStep === 0 && (
                    // --- PASO 1: Oposición ---
                    <FormField
                      control={form.control}
                      name="opposition_id"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold">
                            ¿Cuál es tu oposición principal?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              {oppositions.map((op) => (
                                <FormItem
                                  key={op.id}
                                  className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={op.id} id={`op-${op.id}`} />
                                  </FormControl>
                                  <FormLabel
                                    htmlFor={`op-${op.id}`}
                                    className="font-normal cursor-pointer flex-1"
                                  >
                                    {op.name}
                                    {op.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {op.description}
                                      </p>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentStep === 1 && (
                    // --- PASO 2: Autoevaluación ---
                    <>
                      <FormField
                        control={form.control}
                        name="baseline_assessment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              ¿Qué es lo que más te cuesta o qué necesitas a la hora de estudiar?
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ejemplo: Me cuesta mantener la constancia, me distraigo con facilidad y no sé cómo organizar los repasos..."
                                {...field}
                                rows={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Esto nos ayudará a personalizar tu plan (máx. 500 caracteres).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="help_with"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              ¿En qué áreas podríamos ayudarte más?
                            </FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {helpOptions.map((option) => (
                                  <Badge
                                    key={option}
                                    variant={field.value?.includes(option) ? 'default' : 'outline'}
                                    className="cursor-pointer select-none text-base px-3 py-1 rounded-lg"
                                    onClick={() => {
                                      const currentValue = field.value || [];
                                      if (currentValue.includes(option)) {
                                        field.onChange(
                                          currentValue.filter((item: string) => item !== option)
                                        );
                                      } else {
                                        field.onChange([...currentValue, option]);
                                      }
                                    }}
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </FormControl>
                            <FormDescription>Selecciona una o varias opciones.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentStep === 2 && (
                    // --- PASO 3: Objetivo Semanal ---
                    <FormField
                      control={form.control}
                      name="weekly_study_goal_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">
                            ¿Cuántas horas netas de estudio quieres dedicar a la semana?
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 20"
                              {...field}
                              className="max-w-xs"
                            />
                          </FormControl>
                          <FormDescription>
                            Esto se usará para medir tu progreso en el planificador.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentStep === 3 && (
                    // --- PASO 4: Planificador ---
                    <FormField
                      control={form.control}
                      name="study_days"
                      render={() => (
                        <FormItem className="space-y-6">
                          <div className="space-y-2">
                            <FormLabel className="text-base font-semibold">
                              Crea tu plan de estudio base
                            </FormLabel>
                            <FormDescription>
                              Basado en tu objetivo de{' '}
                              <strong className="text-primary">{weeklyGoalHours} horas</strong>,
                              asigna tus bloques de estudio.
                            </FormDescription>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-primary">Horas Planificadas</span>
                              <span>
                                {totalSelectedHours.toFixed(1)}h / {weeklyGoalHours}h
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="w-full" />
                            {totalSelectedHours > 0 && totalSelectedHours < weeklyGoalHours && (
                              <p className="text-sm text-muted-foreground text-center">
                                ¡Sigue así! Te faltan{' '}
                                {(weeklyGoalHours - totalSelectedHours).toFixed(1)} horas por
                                planificar.
                              </p>
                            )}
                            {totalSelectedHours >= weeklyGoalHours && (
                              <p className="text-sm text-green-600 font-medium text-center">
                                ¡Objetivo de planificación completado!
                              </p>
                            )}
                          </div>

                          <SelectedSlotsSummary selectedSlots={selectedSlots} />

                          <Dialog open={isPlannerOpen} onOpenChange={setIsPlannerOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" className="w-full sm:w-auto">
                                <Calendar className="mr-2 h-4 w-4" />
                                Abrir Planificador Semanal
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[85vh] overflow-auto w-[90vw]">
                              <DialogHeader>
                                <DialogTitle>Planificador de Horarios</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-grow">
                                  <SlotDurationSelector
                                    currentDuration={slotDuration}
                                    onDurationChange={handleDurationChange}
                                  />
                                  <WeeklyPlanner
                                    selectedSlots={selectedSlots}
                                    onToggleSlot={handleToggleSlot}
                                    timeSlots={currentTimeSlots}
                                  />
                                </div>
                                <div className="lg:w-1/3 relative">
                                  <div className="sticky top-0 p-4 space-y-4">
                                    <h4 className="font-semibold">Resumen de Horas</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm font-medium">
                                        <span className="text-primary">Planificadas</span>
                                        <span>
                                          {totalSelectedHours.toFixed(1)}h / {weeklyGoalHours}h
                                        </span>
                                      </div>
                                      <Progress value={progressPercentage} className="w-full" />
                                    </div>
                                    <SelectedSlotsSummary selectedSlots={selectedSlots} />
                                    <Button
                                      type="button"
                                      onClick={() => setIsPlannerOpen(false)}
                                      className="w-full"
                                    >
                                      Cerrar Planificador
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>

                <CardFooter className="pt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNextStep}>
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isServerActionPending}>
                      {isServerActionPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" /> Finalizar onboarding
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
          </Form>
        </main>
      </div>
    </div>
  );
}
