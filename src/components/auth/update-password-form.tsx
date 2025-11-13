'use client';

import React, { useActionState, useEffect, useState } from 'react';
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
import { Eye, EyeClosed } from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ password?: string; confirmPassword?: string }>(
    {}
  );

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Notificación',
        description: state.message,
        variant: state.message.toLowerCase().includes('error') ? 'destructive' : 'default',
      });

      if (!state.message.toLowerCase().includes('error')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  }, [state, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalErrors({});

    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = (fd.get('password') ?? '').toString();
    const confirmPassword = (fd.get('confirmPassword') ?? '').toString();

    if (password !== confirmPassword) {
      setLocalErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    await formAction(fd);
  };

  const renderError = (field: 'password' | 'confirmPassword') =>
    state?.errors?.[field]?.[0] || localErrors[field] ? (
      <p className="text-sm text-destructive">
        {state?.errors?.[field]?.[0] ?? localErrors[field]}
      </p>
    ) : null;

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Nueva Contraseña</CardTitle>
        <CardDescription>Introduce tu nueva contraseña</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="bg-background/80 pr-10"
                aria-invalid={!!(state?.errors?.password || localErrors.password)}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground"
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </button>
            </div>
            {renderError('password')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="bg-background/80 pr-10"
                aria-invalid={!!(state?.errors?.confirmPassword || localErrors.confirmPassword)}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground"
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </button>
            </div>
            {renderError('confirmPassword')}
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
