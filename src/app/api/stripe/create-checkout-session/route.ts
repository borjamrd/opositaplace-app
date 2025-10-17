import { stripe } from '@/lib/stripe';
import { getOrCreateStripeCustomerId } from '@/lib/stripe/actions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json();

    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let customerId: string | undefined;

    if (!user) {
      console.error('Error: Usuario no autenticado al crear sesión de checkout.');
      return NextResponse.json({ error: 'Usuario no autenticado.' }, { status: 401 });
    }

    if (user) {
      customerId = await getOrCreateStripeCustomerId(user);
    }

    if (!customerId) {
      console.error(
        'Error: No se pudo obtener o crear el Stripe Customer ID para el usuario:',
        user.id
      );
      return NextResponse.json(
        { error: 'No se pudo gestionar el ID de cliente de Stripe.' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      client_reference_id: user.id,
      payment_method_collection: 'if_required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/plans?payment_canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: `Error al crear la sesión de pago ${err}` }, { status: 500 });
  }
}
