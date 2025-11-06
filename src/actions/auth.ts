'use server';

import WelcomeEmail from '@/emails/welcome-email';
import { sendEmail } from '@/lib/email/email';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Email inválido.' });
const passwordSchema = z
  .string()
  .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' });

const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function signUp(_prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const result = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores.',
    };
  }

  const { email, password } = result.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Sign up error:', error);
    return {
      message: error.message || 'Error al registrarse. Inténtalo de nuevo.',
      errors: {},
    };
  }

  try {
    console.log({ email });
    await sendEmail({
      to: email,
      subject: '¡Te damos la bienvenida a Opositaplace!',
      emailComponent: WelcomeEmail({ userName: email.split('@')[0] }),
    });
  } catch (emailError) {
    console.error('Error al enviar el email de bienvenida:', emailError);
  }

  return { message: '¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.', errors: {} };
}

export async function signIn(_prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const result = signInSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores.',
    };
  }

  const { email, password } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    if (error.message === 'Invalid login credentials') {
      return { message: 'Credenciales inválidas.', errors: {} };
    }
    return {
      message: 'Error al iniciar sesión. Inténtalo de nuevo.',
      errors: {},
    };
  }

  redirect('/dashboard');
}

const resetPasswordSchema = z.object({
  email: emailSchema,
});

export async function resetPassword(_prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const result = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores.',
    };
  }

  const { email } = result.data;
  
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });

  if (error) {
    console.error('Password reset error:', error);
    return {
      message: 'Error al enviar el correo de recuperación. Inténtalo de nuevo.',
      errors: {},
    };
  }

  return {
    message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
    errors: {},
  };
}

const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores.',
    };
  }

  const { password } = result.data;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error('Update password error:', error);
    return {
      message: 'Error al actualizar la contraseña. Inténtalo de nuevo.',
      errors: {},
    };
  }

  return {
    message: 'Contraseña actualizada correctamente. Se te redirigirá automáticamente al dashboard.',
    errors: {},
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
