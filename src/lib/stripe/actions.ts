import TrialEndedEmail from '@/emails/trial-ended-email';
import { stripe } from '@/lib/stripe/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { InsertSubscription, Subscription } from '@/lib/supabase/types';
import type { User } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendEmail } from '../email/email';
import { STRIPE_PLANS, StripePlan } from './config';
import WelcomeEmail from '@/emails/welcome-email';
import { TRIAL_DAYS } from '../constants';
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
    trial_period_days: TRIAL_DAYS,
    // payment_settings: {
    //   save_default_payment_method: 'on_subscription',
    // },
    expand: ['latest_invoice.payment_intent'],
  });

  await manageSubscriptionStatusChange(stripeSubscription.id, customerId, user.id);
}

export async function createFreeSubscription(user: User): Promise<void> {
  const customerId = await getOrCreateStripeCustomerId(user);
  const freePlan = STRIPE_PLANS.find((p) => p.type === StripePlan.FREE);

  if (!freePlan || !freePlan.priceId) {
    throw new Error('El Price ID del plan FREE no está configurado correctamente.');
  }

  // Creamos una suscripción directa al plan gratuito (sin trial, activa inmediatamente)
  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: freePlan.priceId }],
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  await manageSubscriptionStatusChange(stripeSubscription.id, customerId, user.id);
}
export async function manageSubscriptionStatusChange(
  subscriptionId: string,
  customerId: string,
  knownUserId?: string
) {
  const supabase = await createSupabaseServerClient();
  let userId: string;
  if (knownUserId) {
    console.log(`Using known user ID: ${knownUserId}`);
    userId = knownUserId;
  } else {
    console.log(`Looking up user ID for customer ${customerId}...`);
    const supabase = await createSupabaseServerClient();
    const { data: userProfile, error: noUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (noUserError || !userProfile) {
      console.error(`Webhook Error: User not found for Stripe customer ID ${customerId}`);
      throw new Error(`User not found for Stripe customer ID ${customerId}`);
    }
    userId = userProfile.id;
    console.log(`Found user ID`);
  }

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
    throw new Error(
      `Subscription ${subscriptionId} has no items. Cannot determine current period.`
    );
  }

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
  const subscriptionData: InsertSubscription = {
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0]?.price?.id,
    stripe_customer_id: customerId,
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
    .in('status', ['trialing', 'past_due', 'active'])
    .maybeSingle();

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
  return data;
}

/**
 * Realiza un downgrade de un usuario (Pro -> Free)
 * Llamado desde la UI (ej. PlanSelector)
 */
export async function downgradeSubscriptionToFree() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  // 1. Encontrar la suscripción activa del usuario
  const { data: activeSubscription } = await supabase
    .from('user_subscriptions')
    .select('id, status, price_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'past_due', 'trialing'])
    .single();

  if (!activeSubscription) {
    throw new Error('No se encontró una suscripción activa para cancelar.');
  }

  // 2. Encontrar el Price ID del plan gratuito
  const freePlan = STRIPE_PLANS.find((p) => p.type === StripePlan.FREE);
  if (!freePlan?.priceId) {
    throw new Error('Price ID del plan Gratuito no configurado.');
  }

  // 3. Si ya está en el plan gratuito, no hacer nada
  if (activeSubscription.price_id === freePlan.priceId) {
    return { message: 'Ya estás en el plan gratuito.' };
  }

  // 4. Obtener la suscripción de Stripe para saber el ID del item
  const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.id);
  const currentItemId = stripeSubscription.items.data[0]?.id;

  if (!currentItemId) {
    throw new Error('No se encontró el item de la suscripción de Stripe.');
  }

  // 5. Actualizar la suscripción en Stripe
  try {
    await stripe.subscriptions.update(activeSubscription.id, {
      items: [
        {
          id: currentItemId,
          price: freePlan.priceId, // Cambia al Price ID gratuito
        },
      ],
      proration_behavior: 'none', // No devolver dinero por el tiempo restante
      cancel_at_period_end: false, // Asegura que el plan gratuito continúe
    });

    // 6. ¡Éxito!
    // Stripe enviará un 'customer.subscription.updated'.
    // Nuestro webhook (que ya funciona) recibirá el evento
    // y 'manageSubscriptionStatusChange' actualizará Supabase.

    return { message: 'Has cambiado al plan gratuito.' };
  } catch (error: any) {
    console.error('Error al hacer downgrade en Stripe:', error.message);
    throw new Error('Error al actualizar la suscripción en Stripe.');
  }
}

/**
 * Realiza el downgrade a "Gratis".
 * Esta función es segura para ser llamada desde el webhook (no usa auth.getUser()).
 */
export async function downgradeToFreePlan(subscriptionId: string, customerId: string) {
  console.log(`Downgrading subscription ${subscriptionId} to Free Plan.`);

  const freePlan = STRIPE_PLANS.find((p) => p.type === StripePlan.FREE);
  if (!freePlan?.priceId) {
    throw new Error('Price ID del plan Gratuito no configurado en config.ts');
  }

  const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentItemId = currentSubscription.items.data[0]?.id;

  if (!currentItemId) {
    throw new Error(`No items found on subscription ${subscriptionId} to update.`);
  }

  const latestInvoiceId = currentSubscription.latest_invoice as string;
  try {
    // 1. Actualizar la suscripción en Stripe
    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: freePlan.priceId,
        },
      ],
      proration_behavior: 'none',
      cancel_at_period_end: false,
      payment_settings: {
        payment_method_options: undefined,
        save_default_payment_method: 'off',
      },
    });

    if (latestInvoiceId) {
      try {
        // 1. Intentamos ANULAR (void) la factura. Esto es lo ideal.
        await stripe.invoices.voidInvoice(latestInvoiceId);
        console.log(`Voided invoice.`);
      } catch (voidError: any) {
        // 2. Si falla (ej. la factura ya no está 'open'),
        // volvemos a nuestro plan B: marcarla como no cobrable.
        console.warn(
          `Could not void invoice (${voidError.message}). Falling back to markUncollectible.`
        );
        try {
          await stripe.invoices.markUncollectible(latestInvoiceId);
          console.log(`Marked invoice as uncollectible.`);
        } catch (uncollectibleError: any) {
          console.error(
            `Failed to even mark invoice as uncollectible: ${uncollectibleError.message}`
          );
        }
      }
    }
    // 2. Enviar email de aviso

    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    const userEmail = customer.email;
    const userName = customer.name?.split(' ')[0] || userEmail?.split('@')[0];

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: 'Tu prueba de Opositaplace ha terminado',
        emailComponent: TrialEndedEmail({ userName }),
      });
    }
  } catch (error: any) {
    console.error(`Error downgrading subscription ${subscriptionId}:`, error.message);
    throw error;
  }
}

/**
 * Configura un nuevo usuario:
 * 1. Comprueba si existe usuario en Stripe
 * 2. Si no existe, crea uno
 * 3. Envía el email de bienvenida
 */

export async function setupNewUser(user: User) {
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profile?.stripe_customer_id) {
    return;
  }

  try {
    await getOrCreateStripeCustomerId(user);
  } catch (err) {
    console.error('Error creando customer ID:', err);
  }

  try {
    const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0];
    await sendEmail({
      to: user.email!,
      subject: '¡Bienvenido/a a Opositaplace!',
      emailComponent: WelcomeEmail({ userName: userName || 'Opositor' }),
    });
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
}
