// src/app/api/stripe/create-portal-link/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Tu instancia de Stripe server-side
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getOrCreateStripeCustomerId } from '@/lib/stripe/actions'; // Reutiliza tu acción

export async function POST(req: Request) {
  try {
  
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error de autenticación o usuario no encontrado:', authError);
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const customerId = await getOrCreateStripeCustomerId(user);

    if (!customerId) {
      // Esto no debería ocurrir si getOrCreateStripeCustomerId funciona bien,
      // pero es una guarda por si acaso.
      console.error(
        `No se pudo obtener/crear el ID de cliente de Stripe para el usuario ${user.id}`
      );
      return NextResponse.json(
        { error: 'No se pudo obtener la información del cliente de Stripe.' },
        { status: 500 }
      );
    }

    let clientReturnUrl: string | undefined;
    try {
      const body = await req.json();
      if (body && typeof body.return_url === 'string') {
        clientReturnUrl = body.return_url;
      }
    } catch (e) {
      console.warn("No se pudo leer 'return_url' del cuerpo de la solicitud o no se proveyó.");
    }
    const defaultReturnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;
    // Usa la URL del cliente si se proporcionó y es válida (podrías añadir validación de URL aquí),
    // si no, usa la URL por defecto.
    const returnUrl = clientReturnUrl || defaultReturnUrl;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    if (!portalSession.url) {
      console.error('Error: Stripe Portal Session URL no fue creada.');
      throw new Error('No se pudo crear el enlace al portal de cliente.');
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('Error al crear el enlace al portal de cliente:', err);
    return NextResponse.json(
      { error: `Error al crear el enlace al portal: ${err.message}` },
      { status: 500 }
    );
  }
}
