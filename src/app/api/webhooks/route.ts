import AdminNotificationEmail from '@/emails/admin-notification-email';
import InvoicePaidEmail from '@/emails/invoice-paid-email';
import PaymentFailedEmail from '@/emails/payment-failed-email';
import { sendEmail } from '@/lib/email/email';
import { downgradeToFreePlan, manageSubscriptionStatusChange } from '@/lib/stripe/actions';
import { stripe } from '@/lib/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import Stripe from 'stripe';

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(req: NextRequest) {
  const body = await buffer(req.body as unknown as Readable);
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Webhook Error: Missing Stripe signature or webhook secret.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (
            checkoutSession.mode === 'subscription' &&
            checkoutSession.subscription &&
            checkoutSession.customer
          ) {
            await manageSubscriptionStatusChange(
              checkoutSession.subscription as string,
              checkoutSession.customer as string
            );
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(subscription.id, subscription.customer as string);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(subscription.id, subscription.customer as string);

          // Notificar al admin
          try {
            const customerId = subscription.customer as string;
            const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
            const userEmail = customer.email;
            const adminEmail = process.env.EMAIL_TO;

            if (adminEmail) {
                await sendEmail({
                    to: adminEmail,
                    subject: 'Suscripción Eliminada',
                    emailComponent: AdminNotificationEmail({
                        title: 'Suscripción Eliminada',
                        message: `La suscripción ${subscription.id} ha sido eliminada.`,
                        details: {
                            'Subscription ID': subscription.id,
                            'Customer ID': customerId,
                            'User Email': userEmail,
                            'Status': subscription.status,
                            'Cancel At Period End': subscription.cancel_at_period_end ? 'Yes' : 'No',
                        }
                    })
                });
            }
          } catch (error: any) {
             console.error('Error enviando email al admin (subscription.deleted):', error.message);
          }
          break;
        }

        case 'invoice.paid':
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.amount_paid > 0) {
            const customerId = (invoice as any).customer as string;
            const subscriptionId = (invoice as any).subscription as string;

            if (!customerId || !subscriptionId) {
              console.warn('invoice.payment_succeeded event sin customer o subscription ID.');
              break;
            }

            try {
              const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
              const userEmail = customer.email;
              const userName = customer.name?.split(' ')[0] || userEmail?.split('@')[0];

              if (userEmail) {
                await sendEmail({
                  to: userEmail,
                  subject: 'Tu pago de Opositaplace se ha procesado',
                  emailComponent: InvoicePaidEmail({
                    userName,
                    invoiceUrl: invoice.invoice_pdf || undefined,
                  }),
                });
              }
            } catch (e: any) {
              console.error(
                `Error al recuperar cliente ${customerId} para enviar factura`,
                e.message
              );
            }
            if ((invoice as any).subscription && (invoice as any).customer) {
              await manageSubscriptionStatusChange(
                (invoice as any).subscription as string,
                (invoice as any).customer as string
              );
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = (invoice as any).subscription as string;
          const customerId = (invoice as any).customer as string;

          if (!subscriptionId || !customerId) {
            console.error('Invoice payment failed sin subscription o customer ID.');
            break;
          }

          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const trialEndTimestamp = subscription.trial_end;
            const invoicePeriodStart = invoice.lines.data[0]?.period.start;

            // Información para el admin
            const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
            const userEmail = customer.email;
            const adminEmail = process.env.EMAIL_TO;
            
             if (adminEmail) {
                await sendEmail({
                    to: adminEmail,
                    subject: 'Fallo en el pago de suscripción',
                    emailComponent: AdminNotificationEmail({
                        title: 'Fallo en Pago',
                        message: `El pago para la suscripción ${subscription.id} ha fallado.`,
                        details: {
                            'Subscription ID': subscription.id,
                            'Customer ID': customerId,
                            'User Email': userEmail,
                            'Invoice ID': invoice.id,
                            'Amount Due': (invoice.amount_due / 100).toFixed(2) + ' ' + invoice.currency.toUpperCase(),
                        }
                    })
                });
            }

            if (trialEndTimestamp && invoicePeriodStart === trialEndTimestamp) {
              console.error(`Trial failed at conversion. Downgrading to Free...`);
              await downgradeToFreePlan(subscriptionId, customerId);
            } else {
              console.error(`Active payment failed. Setting to past_due...`);

              await manageSubscriptionStatusChange(subscriptionId, customerId);

              // Notificar al usuario (existente)
              const userName = customer.name?.split(' ')[0] || userEmail?.split('@')[0];

              if (userEmail) {
                await sendEmail({
                  to: userEmail,
                  subject: 'Acción Requerida: Fallo en el pago de tu suscripción',
                  emailComponent: PaymentFailedEmail({ userName }),
                });
              }
            }
          } catch (e: any) {
            console.error(`Error processing invoice.payment_failed for sub `, e.message);
          }

          break;
        }
        default:
          console.log(`Unhandled relevant event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error(`Webhook handler error for event ${event.type}:`, error.message);
      return NextResponse.json({ error: 'Webhook handler failed. View logs.' }, { status: 500 });
    }
  } else {
    console.log(`Received irrelevant event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
