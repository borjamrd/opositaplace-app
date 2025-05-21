"use client";

import { useParams } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client"; //
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button"; //
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; //
import { Input } from "@/components/ui/input"; //
// Label no se usa directamente si todos los labels son FormLabel
// import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; //
import { Textarea } from "@/components/ui/textarea"; //
import { Checkbox } from "@/components/ui/checkbox"; //
import { Badge } from "@/components/ui/badge"; //
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; //
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; //
import { useToast } from "@/hooks/use-toast"; //
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; //
import { AlertCircle, ChevronRight, Loader2, Save } from "lucide-react";
import { submitOnboarding } from "@/actions/onboarding"; // Tu Server Action
import { getActiveOppositions, type Opposition } from "@/lib/supabase/queries/getActiveOppositions"; // Tu función para obtener oposiciones
import { useOppositionStore } from "@/store/opposition-store";

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

const initialActionState: { message: string; errors: any; success: boolean } = {
  message: "",
  errors: null,
  success: false,
};

export default function OnboardingPage() {
  const params = useParams();
  const { toast } = useToast();
  const pageUserId = params.userId as string;

  const [actionState, formAction] = useActionState(
    submitOnboarding,
    initialActionState
  );
  const [activeAccordionItem, setActiveAccordionItem] =
    useState<string>("step-1-opposition");
  const [oppositions, setOppositions] = useState<Opposition[]>([]);
  const [isLoadingOppositions, setIsLoadingOppositions] = useState(true);
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false); // Para el botón "Siguiente"

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const supabase = createClient(); //

  const { setActiveOpposition } = useOppositionStore();
  const [isServerActionPending, startTransition] = useTransition();

  const form = useForm<OnboardingFormValues>({
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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user && user.id !== pageUserId) {
        console.warn(
          "User ID mismatch. Esto debería ser manejado por el middleware."
        );
        // Considera una redirección o mensaje si esto ocurre, aunque el middleware debería prevenirlo.
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
    if (actionState.message) {
      toast({
        title: actionState.success
          ? "Onboarding Completado"
          : "Error en Onboarding",
        description: actionState.message,
        variant: actionState.success ? "default" : "destructive",
      });
    }
    // La redirección la maneja la Server Action (submitOnboarding)
    // Si la acción es exitosa, también actualizamos el store de Zustand.
    // Esto ocurrirá ANTES de que la redirección en la Server Action tenga efecto si la acción devuelve el estado.
    // Pero como la acción redirige, el componente se desmontará. Es mejor que el dashboard
    // se encargue de cargar la oposición activa del usuario al montarse, o que el middleware
    // asegure que `activeOpposition` en Zustand se setee post-login/onboarding.
    // Por ahora, podemos intentar setearlo aquí si la acción fue exitosa y tenemos los datos.
    if (actionState.success) {
      const finalOppositionId = form.getValues("opposition_id");
      if (finalOppositionId) {
        const finalSelectedOp = oppositions.find(
          (op) => op.id === finalOppositionId
        );
        if (finalSelectedOp) {
          setActiveOpposition(finalSelectedOp);
        }
      }
    }
  }, [actionState, toast, setActiveOpposition, form, oppositions]);

  const handleProceedToStep2 = async () => {
    setIsSubmittingStep1(true);
    const result = await form.trigger("opposition_id"); // Validar solo el campo opposition_id
    if (result) {
      setActiveAccordionItem("step-2-details");
    }
    setIsSubmittingStep1(false);
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
        title: "Error",
        description: "Usuario no autenticado.",
        variant: "destructive",
      });
      return;
    }
    // El pageUserId es el que viene de la URL, que debe coincidir con el currentUser.id
    // El middleware debería garantizar esto.
    if (currentUser.id !== pageUserId) {
      toast({
        title: "Error de Seguridad",
        description: "Discrepancia de ID de usuario.",
        variant: "destructive",
      });
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      formData.append("user_id", currentUser.id); // Usar el ID del usuario autenticado
      formData.append("opposition_id", data.opposition_id);
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
                typeof actionState.errors === "object" &&
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
                            fieldErrors.map((error: string, index: number) => (
                              <li key={`${field}-${index}`}>
                                <strong>{field.replace("_", " ")}:</strong>{" "}
                                {error}
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
                onValueChange={
                  // No permitir cambiar de acordeón manualmente si el primero no está completo
                  (value) => {
                    if (
                      value === "step-2-details" &&
                      !form.getValues("opposition_id")
                    ) {
                      form.setError("opposition_id", {
                        type: "manual",
                        message: "Primero debes seleccionar una oposición.",
                      });
                      setActiveAccordionItem("step-1-opposition");
                    } else {
                      setActiveAccordionItem(value);
                    }
                  }
                }
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
                        No hay oposiciones disponibles en este momento. Contacta
                        con el administrador.
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={handleProceedToStep2}
                      disabled={
                        !form.watch("opposition_id") ||
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
                  <AccordionTrigger disabled={!form.getValues("opposition_id")}>
                    Paso 2: Tus Preferencias de Estudio
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
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
                                        id={`day-${dayOption.id}`}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      htmlFor={`day-${dayOption.id}`}
                                      className="font-normal whitespace-nowrap cursor-pointer"
                                    >
                                      {dayOption.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          {form.formState.errors.study_days_options?.root && (
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
                disabled={
                  isServerActionPending ||
                  activeAccordionItem !== "step-2-details" ||
                  !form.getValues("opposition_id")
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
                    Finalizar
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
