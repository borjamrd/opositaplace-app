"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.string().email({ message: "Email inválido." });
const passwordSchema = z
  .string()
  .min(6, { message: "La contraseña debe tener al menos 6 caracteres." });

const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function signUp(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const result = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores.",
    };
  }

  const { email, password } = result.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, // Adjust if you have a base URL env var
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    return {
      message: error.message || "Error al registrarse. Inténtalo de nuevo.",
      errors: {},
    };
  }

  // For Supabase, email confirmation is usually required.
  // You might want to redirect to a page saying "Check your email"
  // or handle it differently. For now, redirecting to login.
  // Revalidate path or redirect if needed by Supabase SSR helpers
  // redirect('/login?message=Revisa tu correo para confirmar tu cuenta');
  return { message: "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.", errors: {} };
}

export async function signIn(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const result = signInSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores.",
    };
  }

  const { email, password } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    if (error.message === "Invalid login credentials") {
      return { message: "Credenciales inválidas.", errors: {} };
    }
    return {
      message: "Error al iniciar sesión. Inténtalo de nuevo.",
      errors: {},
    };
  }

  redirect("/dashboard");
}

const resetPasswordSchema = z.object({
  email: emailSchema,
});

export async function resetPassword(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const result = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores.",
    };
  }

  const { email } = result.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    return {
      message: "Error al enviar el correo de recuperación. Inténtalo de nuevo.",
      errors: {},
    };
  }

  return {
    message: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña.",
    errors: {},
  };
}

// ...existing code...

const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});


export async function updatePassword(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Por favor, corrige los errores.",
    };
  }

  const { password } = result.data;

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error("Update password error:", error);
    return {
      message: "Error al actualizar la contraseña. Inténtalo de nuevo.",
      errors: {},
    };
  }

  // Instead of redirecting immediately, return a success message
  return {
    message: "Contraseña actualizada correctamente",
    errors: {},
  };
}


export async function signOut() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerActionClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}
