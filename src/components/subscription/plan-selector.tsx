// src/components/subscription/PlanSelector.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, StripePlan } from '@/lib/stripe/config';
import type { User } from '@supabase/supabase-js';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubscribeButton } from './subscribe-button';
import { useSubscriptionStore } from '@/store/subscription-store';

interface PlanSelectorProps {
    user: User | null;
    source?: 'plansPage' | 'profileModal';
    onboardingCompleted?: boolean;
}

export function PlanSelector({
    user,
    source = 'plansPage',
    onboardingCompleted = false,
}: PlanSelectorProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { subscription: activeSubscription } = useSubscriptionStore();

    const handleManageSubscription = async () => {
        if (!user) {
            toast({
                title: 'Necesitas iniciar sesión',
                description: 'Por favor, inicia sesión para gestionar tu suscripción.',
                variant: 'default',
            });
            router.push(
                `/login?redirect=${source === 'profileModal' ? '/dashboard/profile' : '/plans'}`
            );
            return;
        }
        setIsLoading('manage');
        try {
            const response = await fetch('/api/stripe/create-portal-link', {
                method: 'POST',
                body: JSON.stringify({ return_url: window.location.href }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'No se pudo obtener el enlace al portal.');
            }
        } catch (error: any) {
            console.error('Error managing subscription:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            {onboardingCompleted && source === 'plansPage' && (
                <div className="mb-10 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md flex items-center gap-3">
                    <p>¡Hola! Bienvenid@ a Opositaplace. Puedes configurar el plan que más se adapte a tus necesidades. No te preocupes, siempre lo puedes modificar desde tu perfil.</p>
                </div>
            )}
            {(!onboardingCompleted || source === 'profileModal') && !activeSubscription && (
                <>
                    <h1 className="text-3xl font-bold text-center mb-4">
                        {source === 'profileModal' ? 'Nuestros Planes' : 'Elige tu Plan'}
                    </h1>
                    {source !== 'profileModal' && (
                        <p className="text-center text-muted-foreground mb-12">
                            Comienza con el plan que mejor se adapte a tus necesidades de
                            preparación.
                        </p>
                    )}
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {STRIPE_PLANS.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`flex flex-col ${
                            plan.type === StripePlan.BASIC
                                ? 'border-2 border-primary shadow-xl'
                                : ''
                        }`}
                    >
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-3xl font-bold mb-4">{plan.price}</p>
                            <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        {!activeSubscription && (
                            <CardFooter>
                                <SubscribeButton
                                    plan={plan}
                                    user={user}
                                    onboardingCompleted={onboardingCompleted}
                                />
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
            {activeSubscription && (
                <div className="text-center mt-6">
                    <Button
                        onClick={handleManageSubscription}
                        variant="default"
                        disabled={isLoading === 'manage'}
                    >
                        {isLoading === 'manage' ? 'Cargando...' : 'Gestionar mi Suscripción'}
                    </Button>
                </div>
            )}
        </div>
    );
}
