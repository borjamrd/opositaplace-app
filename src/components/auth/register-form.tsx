'use client';

import { signUp } from '@/actions/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import ProvidersForm from './providers-form';

export function RegisterForm() {
  const [state, formAction] = useActionState(signUp, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      // Verifica si no hay errores de campo específicos de Zod o si errors es un objeto vacío
      const hasNoFieldSpecificErrors =
        !state.errors ||
        (typeof state.errors === 'object' && Object.keys(state.errors).length === 0);

      // No mostrar toast para el mensaje genérico de "corrige los errores" si hay errores de campo
      const isGenericValidationErrorSummary =
        state.message === 'Por favor, corrige los errores.' && !hasNoFieldSpecificErrors;

      if (hasNoFieldSpecificErrors && !isGenericValidationErrorSummary) {
        const isError =
          state.message.toLowerCase().includes('error') ||
          state.message.toLowerCase().includes('failure') ||
          state.message.toLowerCase().includes('inválid') ||
          state.message.toLowerCase().includes('unexpected');
        toast({
          title: isError ? 'Error de Registro' : 'Registro',
          description: isError ? 'Hay un problema con tu registro.' : 'Registro exitoso.',
          variant: isError ? 'destructive' : 'default',
        });
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Crear cuenta</CardTitle>
        <CardDescription>Únete a Opositaplace y empieza a prepararte.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Mostrar Alert para mensajes generales que no sean errores de campo de Zod */}
          {state?.message &&
            state.message !== 'Por favor, corrige los errores.' &&
            (!state.errors ||
              (typeof state.errors === 'object' && Object.keys(state.errors).length === 0)) && (
              <Alert
                variant={
                  state.message.toLowerCase().includes('error') ||
                  state.message.toLowerCase().includes('failure') ||
                  state.message.toLowerCase().includes('inválid') ||
                  state.message.toLowerCase().includes('unexpected')
                    ? 'destructive'
                    : 'default'
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {state.message.toLowerCase().includes('error') ||
                  state.message.toLowerCase().includes('failure') ||
                  state.message.toLowerCase().includes('inválid') ||
                  state.message.toLowerCase().includes('unexpected')
                    ? 'Error'
                    : 'Notificación'}
                </AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="bg-background/80"
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-background/80"
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="bg-background/80"
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Button variant="link" asChild className="p-0 text-accent">
              <Link href="/login">Inicia sesión aquí</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
      <ProvidersForm prefixMessage="Regístrate con" />
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Registrando...
        </div>
      ) : (
        <>
          <UserPlus className="mr-2 h-5 w-5" />
          Crear Cuenta
        </>
      )}
    </Button>
  );
}
