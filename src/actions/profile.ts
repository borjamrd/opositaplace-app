// src/actions/profile.ts
'use server';

import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export async function deleteUserAccount() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Usuario no autenticado.');
  }

  // 1. Cancelar suscripción en Stripe (si existe)
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('id, stripe_customer_id, status')
    .in('status', ['trialing', 'active'])
    .single();

  if (subscription && subscription.id) {
    try {
      await stripe.subscriptions.cancel(subscription.id);
    } catch (error) {
      console.error('Error al cancelar la suscripción de Stripe:', error);
      return {
        error: 'No se pudo cancelar tu suscripción en Stripe. No se ha eliminado la cuenta.',
      };
    }
  }

  // 2. Limpiar todos los datos del usuario en la base de datos usando la función RPC
  const { error: rpcError } = await supabase.rpc('delete_user_data');

  if (rpcError) {
    console.error('Error al ejecutar delete_user_data RPC:', rpcError);
    return { error: 'No se pudieron eliminar los datos del usuario.' };
  }

  // 3. Eliminar el usuario de Supabase Auth (requiere la clave de servicio)
  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error('Error al eliminar el usuario de Supabase Auth:', deleteUserError);
    return { error: 'No se pudo eliminar la cuenta de usuario.' };
  }

  redirect('/?message=Cuenta eliminada correctamente');
}



export async function updateLoginNotification(profileId: string, newValue: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ notify_on_new_login: newValue })
    .eq('id', profileId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard/profile'); 
  return { success: true };
}