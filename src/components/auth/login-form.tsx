'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn } from '@/actions/auth';
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
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signInWithGoogle } from '@/lib/supabase/actions';
import ProvidersForm from './providers-form';

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, null);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.message) {
      if (state.message === 'Credenciales inválidas.') {
        toast({
          title: 'Error de inicio de sesión',
          description: state.message,
          variant: 'destructive',
        });
      } else if (state.message === 'Por favor, corrige los errores.') {
      } else if (
        !state.errors ||
        (typeof state.errors === 'object' && Object.keys(state.errors).length === 0)
      ) {
        toast({
          title: 'Notificación',
          description: state.message,
          variant:
            state.message.toLowerCase().includes('error') ||
            state.message.toLowerCase().includes('fallo')
              ? 'destructive'
              : 'default',
        });
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu cuenta para continuar tu preparación.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {state?.message &&
            state.message !== 'Credenciales inválidas.' &&
            state.message !== 'Por favor, corrige los errores.' &&
            (!state.errors ||
              (typeof state.errors === 'object' && Object.keys(state.errors).length === 0)) && (
              <Alert
                variant={
                  state.message.toLowerCase().includes('error') ||
                  state.message.toLowerCase().includes('fallo')
                    ? 'destructive'
                    : 'default'
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {state.message.toLowerCase().includes('error') ||
                  state.message.toLowerCase().includes('fallo')
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="bg-background/80 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />

          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Button variant="link" asChild className="p-0">
              <Link href="/register">Regístrate aquí</Link>
            </Button>
          </p>
          <p>
            <Button variant="link" asChild className="p-0">
              <Link href="/reset-password">¿Has olvidado tu contraseña?</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
      <ProvidersForm prefixMessage="Inicia sesión con" />
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
          Iniciando...
        </div>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" />
          Iniciar Sesión
        </>
      )}
    </Button>
  );
}
