// src/actions/profile.ts
'use server';

import { stripe } from '@/lib/stripe/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProfileSettings, ProfileWithOnboarding } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';
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

  const supabaseAdmin = createSupabaseAdminClient();

  let stripeCustomerId: string | null = null;

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile && profile.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    }
  } catch (error: any) {
    console.error('Error buscando perfil de usuario:', error.message);
  }

  try {
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['trialing', 'active', 'past_due'])
      .maybeSingle();

    if (subscription && subscription.id) {
      console.log(`Cancelando suscripción ${subscription.id} para usuario ${user.id}`);
      await stripe.subscriptions.cancel(subscription.id);
    }
  } catch (error: any) {
    console.error('Error al cancelar la suscripción de Stripe:', error.message);
    return {
      error: 'No se pudo cancelar tu suscripción en Stripe. No se ha eliminado la cuenta.',
    };
  }

  const { error: rpcError } = await supabaseAdmin.rpc('delete_user_data');

  if (rpcError) {
    console.error('Error al ejecutar delete_user_data RPC:', rpcError);
    return { error: 'No se pudieron eliminar los datos del usuario.' };
  }

  console.log({ stripeCustomerId });
  try {
    if (stripeCustomerId) {
      console.log(`Eliminando cliente de Stripe ${stripeCustomerId}`);
      await stripe.customers.del(stripeCustomerId);
    } else {
      console.log('No hay cliente de Stripe que eliminar.');
    }
  } catch (error: any) {
    console.error(`Error al eliminar el cliente de Stripe ${stripeCustomerId}:`, error.message);
  }

  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error('Error al eliminar el usuario de Supabase Auth:', deleteUserError);
    return { error: 'No se pudo eliminar la cuenta de usuario.' };
  }

  redirect('/?message=Cuenta eliminada correctamente');
}
export async function updateProfileSettings(profileId: string, settings: Partial<ProfileSettings>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('profiles').update(settings).eq('id', profileId);

  if (error) {
    console.error('Error updating profile settings:', error);
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function getProfileData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, onboarding_info(*)')
    .eq('id', user.id)
    .single();

  const profileWithOnboarding: ProfileWithOnboarding | null = profile
    ? { ...profile, onboarding: profile.onboarding_info }
    : null;

  return { profile: profileWithOnboarding };
}
