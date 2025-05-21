"use client";

import { useParams } from "next/navigation";
// Importa useTransition de React
import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ... (resto de tus imports sin cambios)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronRight, Loader2, Save } from "lucide-react"; // Asegúrate que Loader2 esté importado
import { submitOnboarding } from "@/actions/onboarding";
import { getActiveOppositions, type Opposition } from "@/lib/supabase/queries";

// ... (onboardingFormSchema y helpOptions sin cambios)
const helpOptions = [
  "Organización del estudio",
  "Técnicas de memorización",
  "Gestión del tiempo",
  "Preparación de casos prácticos",
  "Manejo del estrés y ansiedad",
  "Motivación",
] as const;

const onboardingFormSchema = z.object({
  opposition_id: z
    .string({ required_error: "Debes seleccionar una oposición." })
    .uuid({ message: "ID de oposición inválido." })
    .min(1, "Debes seleccionar una oposición."),
  available_hours: z.coerce
    .number({
      required_error: "Las horas disponibles son requeridas.",
      invalid_type_error: "Debe ser un número",
    })
    .positive({ message: "Debe ser un número positivo" })
    .min(1, "Debes dedicar al menos 1 hora")
    .max(100, "Demasiadas horas, ¿seguro?"),
  objectives: z
    .string()
    .min(10, "Describe tus objetivos (mín. 10 caracteres)")
    .max(500, "Máximo 500 caracteres"),
  help_with: z.array(z.string()).optional().default([]),
  study_days_options: z
    .object({
      monday: z.boolean().default(false),
      tuesday: z.boolean().default(false),
      wednesday: z.boolean().default(false),
      thursday: z.boolean().default(false),
      friday: z.boolean().default(false),
      saturday: z.boolean().default(false),
      sunday: z.boolean().default(false),
    })
    .refine((data) => Object.values(data).some((day) => day === true), {
      message: "Debes seleccionar al menos un día de estudio.",
      path: ["monday"],
    }),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

const initialState: { message: string; errors: any; success: boolean } = {
  message: "",
  errors: null,
  success: false,
};

export default function OnboardingPage() {
  const params = useParams();
  const { toast } = useToast();
  const userId = params.userId as string;

  const [state, formAction] = useActionState(submitOnboarding, initialState);
  const [activeAccordionItem, setActiveAccordionItem] =
    useState<string>("step-1-opposition");
  const [oppositions, setOppositions] = useState<Opposition[]>([]);
  const [isLoadingOppositions, setIsLoadingOppositions] = useState(true);

  // Hook useTransition para la acción del servidor
  const [isServerActionPending, startTransition] = useTransition();

  const form = useForm<OnboardingFormValues>({
    // ... (resto de la configuración de useForm sin cambios)
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      opposition_id: undefined,
      available_hours: 10,
      objectives: "",
      help_with: [],
      study_days_options: {
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
  });

  // ... (useEffect para cargar oposiciones y para el toast sin cambios)
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
    if (state.message) {
      toast({
        title: state.success ? "Onboarding Guardado" : "Error en Onboarding",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  const handleNextStep = async () => {
    const result = await form.trigger("opposition_id"); // Validar solo opposition_id
    if (result) {
      setActiveAccordionItem("step-2-details");
    }
  };

  const studyDayOptions = [
    { id: "monday", label: "Lunes" },
    { id: "tuesday", label: "Martes" },
    { id: "wednesday", label: "Miércoles" },
    { id: "thursday", label: "Jueves" },
    { id: "friday", label: "Viernes" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ] as const;

  if (!userId) {
    /* ... */
  }

  // Modificar onSubmit para usar startTransition
  const onSubmit = (data: OnboardingFormValues) => {
    startTransition(() => {
      // Envolver la lógica de la acción en startTransition
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("opposition_id", data.opposition_id!);
      formData.append("available_hours", data.available_hours.toString());
      formData.append(
        "objectives",
        JSON.stringify({ main_objective: data.objectives })
      );
      formData.append("help_with", JSON.stringify(data.help_with || []));

      const selectedStudyDays: { [key: string]: boolean } = {};
      for (const [day, selected] of Object.entries(data.study_days_options)) {
        if (selected) selectedStudyDays[day] = true;
      }
      formData.append("study_days", JSON.stringify(selectedStudyDays));

      formAction(formData);
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-2xl shadow-xl">
        {/* ... (CardHeader sin cambios) ... */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Configura tu Preparación
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para personalizar tu experiencia en OpositaPlace.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          {/* La prop `action` no es necesaria aquí si usamos handleSubmit y llamamos a formAction manualmente */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* ... (Alerts de error sin cambios) ... */}
              {state?.message && !state.success && !state.errors && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              {state?.errors &&
                typeof state.errors === "object" &&
                !Array.isArray(state.errors) &&
                state.errors !== null && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de validación</AlertTitle>
                    <AlertDescription>
                      Por favor, corrige los siguientes errores:
                      <ul>
                        {Object.entries(state.errors).map(
                          ([field, fieldErrors]: [string, any]) =>
                            Array.isArray(fieldErrors) &&
                            fieldErrors.map((error: string, index: number) => (
                              <li key={`${field}-${index}`}>
                                <strong>{field}:</strong> {error}
                              </li>
                            ))
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

              <Accordion
                type="single"
                collapsible
                value={activeAccordionItem}
                onValueChange={setActiveAccordionItem}
                className="w-full"
              >
                <AccordionItem value="step-1-opposition">
                  <AccordionTrigger>
                    Paso 1: Selecciona tu Oposición Principal
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    {/* ... (contenido del primer acordeón sin cambios) ... */}
                    {isLoadingOppositions ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Cargando oposiciones...</p>
                      </div>
                    ) : oppositions.length > 0 ? (
                      <Controller
                        control={form.control}
                        name="opposition_id"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Oposiciones disponibles:</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                {oppositions.map((op) => (
                                  <FormItem
                                    key={op.id}
                                    className="flex items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <RadioGroupItem value={op.id} />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {op.name}
                                      {op.description && (
                                        <p className="text-xs text-muted-foreground">
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
                      <p>
                        No hay oposiciones disponibles en este momento. Contacta
                        con el administrador.
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        !form.watch("opposition_id") || isLoadingOppositions
                      }
                    >
                      Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2-details">
                  <AccordionTrigger disabled={!form.getValues("opposition_id")}>
                    Paso 2: Tus Preferencias de Estudio
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    {/* ... (contenido del segundo acordeón sin cambios, FormFields para available_hours, objectives, etc.) ... */}
                    <FormField
                      control={form.control}
                      name="available_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas disponibles a la semana</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            ¿Cuántas horas puedes dedicar al estudio
                            semanalmente?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            Describe brevemente tus metas (máx. 500 caracteres).
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
                                    field.value?.includes(option)
                                      ? "default"
                                      : "outline"
                                  }
                                  className="cursor-pointer select-none"
                                  onClick={() => {
                                    const currentValue = field.value || [];
                                    if (currentValue.includes(option)) {
                                      field.onChange(
                                        currentValue.filter(
                                          (item: string) => item !== option
                                        )
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
                          <FormDescription>
                            Selecciona una o varias opciones.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="study_days_options"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">
                              Días de estudio
                            </FormLabel>
                            <FormDescription>
                              Selecciona los días que planeas estudiar.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                            {studyDayOptions.map((dayOption) => (
                              <FormField
                                key={dayOption.id}
                                control={form.control}
                                name={`study_days_options.${dayOption.id}`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal whitespace-nowrap">
                                      {dayOption.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          {form.formState.errors.study_days_options &&
                            form.formState.errors.study_days_options.root && (
                              <p className="text-sm font-medium text-destructive pt-2">
                                {
                                  form.formState.errors.study_days_options.root
                                    .message
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
                // Actualizar estado disabled para incluir isServerActionPending
                disabled={
                  form.formState.isSubmitting ||
                  isServerActionPending ||
                  activeAccordionItem !== "step-2-details" ||
                  !form.getValues("opposition_id")
                }
              >
                {form.formState.isSubmitting || isServerActionPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Guardar Onboarding
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
