'use client';

import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import { useActionState, useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { submitOnboarding } from '@/actions/onboarding';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getActiveOppositions, type Opposition } from '@/lib/supabase/queries/getActiveOppositions';
import { useOppositionStore } from '@/store/opposition-store';
import { AlertCircle, Calendar, ChevronRight, Loader2, Save } from 'lucide-react';

// Importaciones del planificador semanal
import {
    DAYS_OF_WEEK_ORDERED,
    PLANNER_END_HOUR,
    SLOT_DURATION_OPTIONS,
    generateTimeSlots,
} from '@/components/weekly-planner/constants';
import SelectedSlotsSummary from '@/components/weekly-planner/SelectedSlotsSummary';
import SlotDurationSelector from '@/components/weekly-planner/SlotDurationSelector';
import { Day, SelectedSlots } from '@/components/weekly-planner/types';
import WeeklyPlanner from '@/components/weekly-planner/WeeklyPlanner';

// Importaciones de Dialog
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { parseSlotToMinutes } from '@/components/weekly-planner/utils';

// Función de ayuda para inicializar los slots seleccionados
export const initializeSelectedSlots = (timeSlotsArray: string[]): SelectedSlots => {
    const slots = {} as SelectedSlots;
    DAYS_OF_WEEK_ORDERED.forEach((day) => {
        slots[day] = {};
        timeSlotsArray.forEach((slot) => {
            slots[day][slot] = false;
        });
    });
    return slots;
};

const helpOptions = [
    'Organización del estudio',
    'Técnicas de memorización',
    'Gestión del tiempo',
    'Preparación de casos prácticos',
    'Manejo del estrés y ansiedad',
    'Motivación',
] as const;

// Esquema de validación del formulario con Zod
const onboardingFormSchema = z.object({
    opposition_id: z
        .string({ required_error: 'Debes seleccionar una oposición.' })
        .uuid({ message: 'ID de oposición inválido.' })
        .min(1, 'Debes seleccionar una oposición.'),
    objectives: z
        .string()
        .min(10, 'Describe tus objetivos (mín. 10 caracteres)')
        .max(500, 'Máximo 500 caracteres'),
    help_with: z.array(z.string()).optional().default([]),
    study_days: z
        .record(
            z.nativeEnum(Day), // Las claves son los días del enum Day
            z.record(z.string(), z.boolean()) // Los valores son un objeto de timeSlot: boolean
        )
        .refine(
            (data) => {
                // Verifica que al menos un slot esté seleccionado en cualquier día
                return Object.values(data).some((daySlots) =>
                    Object.values(daySlots).some((isSelected) => isSelected)
                );
            },
            {
                message: 'Debes seleccionar al menos una franja horaria de estudio.',
                path: ['study_days'], // La validación se aplica a todo el objeto study_days
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

export default function OnboardingPage() {
    const params = useParams();
    const { toast } = useToast();
    const pageUserId = params.userId as string;

    const [actionState, formAction] = useActionState(submitOnboarding, initialActionState);
    const [activeAccordionItem, setActiveAccordionItem] = useState<string>('step-1-opposition');
    const [oppositions, setOppositions] = useState<Opposition[]>([]);
    const [isLoadingOppositions, setIsLoadingOppositions] = useState(true);
    const [isSubmittingStep1, setIsSubmittingStep1] = useState(false);
    const [isSubmittingStep2, setIsSubmittingStep2] = useState(false);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const supabase = createClient();

    const { setActiveOpposition } = useOppositionStore();
    const [isServerActionPending, startTransition] = useTransition();

    // Estados para el nuevo planificador semanal
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Inicialización del formulario
    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingFormSchema),
        defaultValues: {
            opposition_id: undefined,
            objectives: '',
            help_with: [],
            study_days: {},
            slot_duration_minutes: defaultDuration,
        },
    });

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user && user.id !== pageUserId) {
                console.warn('User ID mismatch. Esto debería ser manejado por el middleware.');
            }
        };
        getUser();
    }, [supabase, pageUserId]);

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
        const newTimeSlots = generateTimeSlots(slotDuration);
        setCurrentTimeSlots(newTimeSlots);

        // Actualizar el valor en el formulario cuando cambie la duración
        form.setValue('slot_duration_minutes', slotDuration, { shouldValidate: true });

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

                            // Caso 1: Slot antiguo contenido en el nuevo (duración aumentada)
                            const oldContainedInNew =
                                oldSlotTimes.startMinutes >= newSlotTimes.startMinutes &&
                                oldSlotTimes.endMinutes <= newSlotTimes.endMinutes;

                            // Caso 2: Nuevo slot contenido en el antiguo (duración reducida)
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
    }, [selectedSlots, form]);

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
                    setActiveOpposition(finalSelectedOp);
                }
            }
        }
    }, [actionState, toast, setActiveOpposition, form, oppositions]);

    const handleProceedToStep2 = async () => {
        setIsSubmittingStep1(true);
        const result = await form.trigger('opposition_id');
        if (result) {
            setActiveAccordionItem('step-2-details');
        }
        setIsSubmittingStep1(false);
    };

    const handleProceedToStep3 = async () => {
        setIsSubmittingStep2(true);
        const result = await form.trigger(['objectives', 'help_with']); // Añadir help_with a la validación
        if (result) {
            setActiveAccordionItem('step-3-study-days');
        }
        setIsSubmittingStep2(false);
    };

    const handleToggleSlot = useCallback(
        (day: Day, timeSlot: string) => {
            setSelectedSlots((prev) => {
                const currentDaySlots = prev[day] || {};
                const wasSelected = currentDaySlots[timeSlot];

                if (typeof wasSelected === 'undefined') {
                    return prev;
                }

                const newDaySlots = { ...currentDaySlots };
                newDaySlots[timeSlot] = !newDaySlots[timeSlot];

                return {
                    ...prev,
                    [day]: newDaySlots,
                };
            });
        },
        [] // No depende de 'form' ya que actualizamos el estado local y luego un useEffect sincroniza con el form
    );

    const handleDurationChange = useCallback((newDuration: number) => {
        setSlotDuration(newDuration);
    }, []);

    // Muestra un loader mientras se obtiene el usuario actual o las oposiciones
    if (!currentUser || isLoadingOppositions) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando datos...</span>
            </div>
        );
    }
    // Si pageUserId no está disponible (nunca debería pasar si la ruta está bien formada)
    if (!pageUserId)
        return (
            <div className="flex min-h-screen items-center justify-center">
                Error: No se pudo identificar al usuario.
            </div>
        );

    const handleFinalSubmit = (data: OnboardingFormValues) => {
        if (!currentUser) {
            toast({
                title: 'Error',
                description: 'Usuario no autenticado.',
                variant: 'destructive',
            });
            return;
        }
        if (currentUser.id !== pageUserId) {
            toast({
                title: 'Error de Seguridad',
                description: 'Discrepancia de ID de usuario.',
                variant: 'destructive',
            });
            return;
        }

        // Antes de enviar, verifica que al menos un slot esté seleccionado
        const hasAnySlotSelected = Object.values(selectedSlots).some((daySlots) =>
            Object.values(daySlots).some((isSelected) => isSelected)
        );

        if (!hasAnySlotSelected) {
            toast({
                title: 'Error de validación',
                description: 'Debes seleccionar al menos una franja horaria de estudio.',
                variant: 'destructive',
            });
            // Puedes también setear un error en el formulario si study_days fuera un campo directo
            // form.setError('study_days', { type: 'manual', message: 'Debes seleccionar al menos una franja horaria de estudio.' });
            return;
        }

        startTransition(() => {
            const formData = new FormData();
            formData.append('user_id', currentUser.id);
            formData.append('opposition_id', data.opposition_id);
            formData.append('objectives', JSON.stringify({ main_objective: data.objectives }));
            formData.append('help_with', JSON.stringify(data.help_with || []));

            // === Envío de la nueva estructura de selectedSlots ===
            formData.append('study_days', JSON.stringify(selectedSlots));
            formData.append('slot_duration_minutes', data.slot_duration_minutes.toString());

            formAction(formData);
        });
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">
                        Configura tu Preparación
                    </CardTitle>
                    <CardDescription>
                        Sigue estos pasos para personalizar tu experiencia en OpositaPlace.
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFinalSubmit)}>
                        <CardContent className="space-y-6">
                            {actionState?.message &&
                                !actionState.success &&
                                !actionState.errors && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{actionState.message}</AlertDescription>
                                    </Alert>
                                )}
                            {actionState?.errors &&
                                typeof actionState.errors === 'object' &&
                                !Array.isArray(actionState.errors) &&
                                actionState.errors !== null && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error de validación</AlertTitle>
                                        <AlertDescription>
                                            Por favor, corrige los siguientes errores:
                                            <ul className="list-disc pl-5 mt-2">
                                                {Object.entries(actionState.errors).map(
                                                    ([field, fieldErrors]: [string, any]) =>
                                                        Array.isArray(fieldErrors) &&
                                                        fieldErrors.map(
                                                            (error: string, index: number) => (
                                                                <li key={`${field}-${index}`}>
                                                                    <strong>
                                                                        {field.replace('_', ' ')}:
                                                                    </strong>{' '}
                                                                    {error}
                                                                </li>
                                                            )
                                                        )
                                                )}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                )}

                            <Accordion
                                type="single"
                                collapsible
                                value={activeAccordionItem}
                                onValueChange={(value) => {
                                    if (
                                        value === 'step-2-details' &&
                                        !form.getValues('opposition_id')
                                    ) {
                                        form.setError('opposition_id', {
                                            type: 'manual',
                                            message: 'Primero debes seleccionar una oposición.',
                                        });
                                        setActiveAccordionItem('step-1-opposition');
                                    } else if (
                                        value === 'step-3-study-days' &&
                                        !form.getValues('objectives')
                                    ) {
                                        setActiveAccordionItem('step-2-details');
                                        toast({
                                            title: 'Error',
                                            description:
                                                'Completa tus preferencias de estudio primero.',
                                            variant: 'destructive',
                                        });
                                    } else {
                                        setActiveAccordionItem(value);
                                    }
                                }}
                                className="w-full"
                            >
                                <AccordionItem value="step-1-opposition">
                                    <AccordionTrigger>
                                        Paso 1: Selecciona tu Oposición Principal
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        {isLoadingOppositions ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <p className="ml-2">Cargando oposiciones...</p>
                                            </div>
                                        ) : oppositions.length > 0 ? (
                                            <FormField
                                                control={form.control}
                                                name="opposition_id"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-base font-semibold">
                                                            Oposiciones disponibles:
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
                                                                        className="flex items-center space-x-3 p-2 border rounded-md hover:bg-accent/50 transition-colors"
                                                                    >
                                                                        <FormControl>
                                                                            <RadioGroupItem
                                                                                value={op.id}
                                                                                id={`op-${op.id}`}
                                                                            />
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
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No hay oposiciones disponibles en este momento.
                                                Contacta con el administrador.
                                            </p>
                                        )}
                                        <Button
                                            type="button"
                                            onClick={handleProceedToStep2}
                                            disabled={
                                                !form.watch('opposition_id') ||
                                                isLoadingOppositions ||
                                                isSubmittingStep1
                                            }
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmittingStep1 ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            Siguiente Paso <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="step-2-details">
                                    <AccordionTrigger disabled={!form.getValues('opposition_id')}>
                                        Paso 2: Tus Preferencias de Estudio
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="objectives"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Objetivos Principales</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Ej: Aprobar la oposición..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Describe brevemente tus metas (máx. 500
                                                        caracteres).
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
                                                    <FormLabel>
                                                        ¿En qué áreas podríamos ayudarte más?
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {helpOptions.map((option) => (
                                                                <Badge
                                                                    key={option}
                                                                    variant={
                                                                        field.value?.includes(
                                                                            option
                                                                        )
                                                                            ? 'default'
                                                                            : 'outline'
                                                                    }
                                                                    className="cursor-pointer select-none"
                                                                    onClick={() => {
                                                                        const currentValue =
                                                                            field.value || [];
                                                                        if (
                                                                            currentValue.includes(
                                                                                option
                                                                            )
                                                                        ) {
                                                                            field.onChange(
                                                                                currentValue.filter(
                                                                                    (
                                                                                        item: string
                                                                                    ) =>
                                                                                        item !==
                                                                                        option
                                                                                )
                                                                            );
                                                                        } else {
                                                                            field.onChange([
                                                                                ...currentValue,
                                                                                option,
                                                                            ]);
                                                                        }
                                                                    }}
                                                                >
                                                                    {option}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>
                                                        Selecciona una o varias opciones.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleProceedToStep3}
                                            disabled={
                                                !form.watch('objectives') || isSubmittingStep2
                                            }
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmittingStep2 ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            Siguiente Paso <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="step-3-study-days">
                                    <AccordionTrigger disabled={!form.getValues('objectives')}>
                                        Paso 3: Días de Estudio
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="study_days"
                                            render={() => (
                                                <FormItem className="space-y-6">
                                                    <div className="mb-4">
                                                        <FormLabel className="text-base">
                                                            Horario de Estudio Semanal
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Configura tus horarios preferidos de
                                                            estudio para cada día.
                                                        </FormDescription>
                                                    </div>
                                                    <div>
                                                        <SelectedSlotsSummary
                                                            selectedSlots={selectedSlots}
                                                        />
                                                    </div>
                                                    <Dialog
                                                        open={isDialogOpen}
                                                        onOpenChange={setIsDialogOpen}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full sm:w-auto"
                                                            >
                                                                <Calendar className="mr-2 h-4 w-4" />
                                                                Configurar Horarios
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-6xl max-h-[75vh] overflow-auto w-[90vw]">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Planificador de Horarios
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="flex flex-col lg:flex-row">
                                                                <div className="flex flex-col">
                                                                    <SlotDurationSelector
                                                                        currentDuration={
                                                                            slotDuration
                                                                        }
                                                                        onDurationChange={
                                                                            handleDurationChange
                                                                        }
                                                                    />
                                                                    <WeeklyPlanner
                                                                        selectedSlots={
                                                                            selectedSlots
                                                                        }
                                                                        onToggleSlot={
                                                                            handleToggleSlot
                                                                        }
                                                                        timeSlots={currentTimeSlots}
                                                                    />
                                                                </div>
                                                                <div className="mt-6 relative">
                                                                    <div className="sticky top-3 p-4">
                                                                        {/* Summary dentro del diálogo, opcional si ya se muestra fuera */}
                                                                        <SelectedSlotsSummary
                                                                            selectedSlots={
                                                                                selectedSlots
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {form.formState.errors.study_days?.root && (
                                                        <p className="text-sm font-medium text-destructive">
                                                            {
                                                                form.formState.errors.study_days
                                                                    .root?.message
                                                            }
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isServerActionPending ||
                                    activeAccordionItem !== 'step-3-study-days' ||
                                    !form.getValues('opposition_id') ||
                                    !form.getValues('objectives') ||
                                    // === AÑADIR CONDICIÓN PARA VALIDAR selectedSlots ===
                                    !Object.values(selectedSlots).some((daySlots) =>
                                        Object.values(daySlots).some((isSelected) => isSelected)
                                    )
                                    // =================================================
                                }
                            >
                                {isServerActionPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
                                        Onboarding...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" /> Guardar Onboarding y
                                        finalizar
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
