// src/actions/session.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updateUserActiveOpposition(oppositionId: string) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Usuario no autenticado.' };
  }

  // Desactivar todas las oposiciones del usuario en una transacción
  const { error: deactivateError } = await supabase
    .from('user_oppositions')
    .update({ active: false })
    .eq('profile_id', user.id);

  if (deactivateError) {
    console.error("Error deactivating user oppositions:", deactivateError);
    return { error: 'No se pudieron actualizar las oposiciones.' };
  }

  // Activar la nueva oposición seleccionada
  const { error: activateError } = await supabase
    .from('user_oppositions')
    .update({ active: true })
    .eq('profile_id', user.id)
    .eq('opposition_id', oppositionId);

  if (activateError) {
    console.error("Error activating new opposition:", activateError);
    return { error: 'No se pudo activar la nueva oposición.' };
  }

  // ¡Magia! Esto le dice a Next.js que los datos del layout del dashboard
  // están obsoletos y deben volver a cargarse en la próxima navegación.
  revalidatePath('/dashboard', 'layout');

  return { success: true };
}