'use client';

import { updatePassword } from '@/actions/auth';
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
import { useActionState, useEffect } from 'react';

interface ActionState {
  message?: string;
  errors?: {
    password?: string[];
    confirmPassword?: string[];
  };
}

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(updatePassword, {});
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Notificación',
        description: state.message,
        variant: state.message.toLowerCase().includes('error') ? 'destructive' : 'default',
      });

      // If the update was successful, redirect after showing the toast
      if (!state.message.toLowerCase().includes('error')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // Wait 2 seconds before redirecting
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Nueva Contraseña</CardTitle>
        <CardDescription>Introduce tu nueva contraseña</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
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
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
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
        <CardFooter>
          <Button type="submit" className="w-full">
            Actualizar Contraseña
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
