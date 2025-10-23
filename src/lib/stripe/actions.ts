import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '../supabase/client';
import { STRIPE_PLANS, StripePlan } from './config';

export type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

export async function getOrCreateStripeCustomerId(
  user: User,
  params?: Stripe.CustomerCreateParams
): Promise<string> {

  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile for Stripe customer ID:', profileError);
    throw profileError;
  }

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customerData: Stripe.CustomerCreateParams = {
    email: user.email,
    name: user.user_metadata?.full_name || user.email,
    metadata: {
      supabaseUUID: user.id,
    },
    ...params,
  };

  const customer = await stripe.customers.create(customerData);
  if (!customer) throw new Error('Could not create Stripe customer');

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile with Stripe customer ID:', updateError);
    throw updateError;
  }

  console.log(`Created Stripe customer ${customer.id} for user ${user.id}`);
  return customer.id;
}

export async function createTrialSubscription(user: User): Promise<void> {
  const customerId = await getOrCreateStripeCustomerId(user);
  const proPlan = STRIPE_PLANS.find((p) => p.type === StripePlan.PRO);

  if (!proPlan || !proPlan.priceId || proPlan.priceId.includes('_placeholder')) {
    throw new Error('El Price ID del plan PRO no está configurado correctamente.');
  }

  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: proPlan.priceId }],
    trial_period_days: 7,
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  await manageSubscriptionStatusChange(stripeSubscription.id, customerId);
}
export async function manageSubscriptionStatusChange(subscriptionId: string, customerId: string) {
  const supabase = createClient();
  const { data: userProfile, error: noUserError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noUserError || !userProfile) {
    console.error(`Webhook Error: User not found for Stripe customer ID ${customerId}`);
    throw new Error(`User not found for Stripe customer ID ${customerId}`);
  }

  const userId = userProfile.id;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'items.data.price.product'],
  });

  const createdTimestamp = subscription.created;
  let currentPeriodStartTimestamp: number | undefined;
  let currentPeriodEndTimestamp: number | undefined;

  if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    currentPeriodStartTimestamp = item.current_period_start;
    currentPeriodEndTimestamp = item.current_period_end;
  } else {
    console.error(
      `[Webhook Error] Subscription ${subscriptionId} has no items. Cannot determine current period.`
    );
    // Decide cómo manejar esto: ¿lanzar un error o intentar continuar sin estas fechas?
    // Si current_period_start/end son NOT NULL en tu DB, necesitas estos valores.
    throw new Error(
      `Subscription ${subscriptionId} has no items. Cannot determine current period.`
    );
  }

  // Verificación de timestamps críticos
  if (
    typeof createdTimestamp !== 'number' ||
    typeof currentPeriodStartTimestamp !== 'number' ||
    typeof currentPeriodEndTimestamp !== 'number'
  ) {
    const errorMsg = `[Webhook Error] Critical Stripe timestamp(s) are missing or not numbers for subscription ${subscriptionId}`;
    console.error(errorMsg, {
      created: createdTimestamp,
      current_period_start: currentPeriodStartTimestamp,
      current_period_end: currentPeriodEndTimestamp,
    });
    throw new Error(errorMsg);
  }
  const subscriptionData: Database['public']['Tables']['user_subscriptions']['Insert'] = {
    id: subscription.id,
    user_id: userId, // Asegúrate que userId está definido correctamente
    status: subscription.status,
    price_id: subscription.items.data[0]?.price?.id, // Chequeo opcional por si acaso
    quantity:
      subscription.items.data.length > 0 && subscription.items.data[0].quantity !== undefined
        ? subscription.items.data[0].quantity
        : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: new Date(createdTimestamp * 1000).toISOString(),
    current_period_start: new Date(currentPeriodStartTimestamp * 1000).toISOString(),
    current_period_end: new Date(currentPeriodEndTimestamp * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };

  const { error } = await supabase.from('user_subscriptions').upsert(subscriptionData, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Error upserting subscription to Supabase:', error);
    throw error;
  }
  console.log(`Upserted subscription [${subscription.id}] for user [${userId}]`);
}

export async function getUserSubscription(): Promise<Subscription | null> {

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
  return data;
}
