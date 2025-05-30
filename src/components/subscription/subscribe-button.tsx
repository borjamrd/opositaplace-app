// src/components/subscription/subscribe-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getStripe } from '@/lib/stripe-client'; // Asumimos que este archivo existe y funciona
import { useToast } from '@/hooks/use-toast';
import { Plan, StripePlan } from '@/lib/stripe/config'; // Importa tus tipos
import type { User } from '@supabase/supabase-js'; // O el tipo de usuario que uses
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscription-store';

interface SubscribeButtonProps {
    plan: Plan;
    user: User | null; // El usuario actual, puede ser null si no está logueado
    onboardingCompleted?: boolean;
}

export function SubscribeButton({ plan, user, onboardingCompleted = false }: SubscribeButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { activeSubscription } = useSubscriptionStore();

    const handleSubscribe = async () => {
        if (!user && plan.type !== StripePlan.FREE) {
            toast({
                title: 'Necesitas iniciar sesión',
                description: 'Por favor, inicia sesión o regístrate para continuar.',
                variant: 'default',
            });
            const redirectUrl = `/login?redirect=/plans${
                // Asumiendo que /plans es tu página de planes
                onboardingCompleted ? '&source=onboarding_completed' : ''
            }`;
            router.push(redirectUrl);
            return;
        }

        if (plan.type === StripePlan.FREE) {
            toast({
                title: 'Plan Gratuito Activado',
                description: '¡Ya puedes empezar a usar OpositaPlace!',
                variant: 'default',
            });
            router.push('/dashboard');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    successUrl: `${window.location.origin}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`, // Incluir session_id es útil
                    cancelUrl: `${window.location.origin}/plans?payment_canceled=true`,
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.sessionId) {
                const stripe = await getStripe();
                if (!stripe) {
                    throw new Error('Stripe.js no se pudo cargar.');
                }
                const { error } = await stripe.redirectToCheckout({
                    sessionId: data.sessionId,
                });
                if (error) {
                    throw new Error(error.message || 'Error al redirigir a Stripe.');
                }
            } else {
                throw new Error('No se recibió sessionId del servidor.');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error de Suscripción',
                description: error.message || 'Ha ocurrido un error al procesar el pago',
            });
        } finally {
            setLoading(false);
        }
    };

    const isDisabled =
        loading || (plan.type !== StripePlan.FREE && plan.priceId.includes('_placeholder'));
    const buttonText = loading
        ? 'Procesando...'
        : activeSubscription && activeSubscription.price_id === plan.priceId
        ? 'Ya estás suscrito a este plan'
        : plan.type === StripePlan.FREE
        ? 'Comenzar con Plan Gratuito'
        : `Suscribirse a ${plan.name}`;

    return (
        <div className="mb-4">
            <Button
                onClick={handleSubscribe}
                disabled={isDisabled}
                className="w-full"
                variant={plan.type === StripePlan.BASIC ? 'default' : 'outline'} // Ejemplo de variante
            >
                {buttonText}
            </Button>
        </div>
    );
}
