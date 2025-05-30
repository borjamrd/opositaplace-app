'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogHeader } from '@/components/ui/dialog';
import { AlertCircle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useState, useCallback, useEffect } from 'react';
import { useSubscriptionStore } from '@/store/subscription-store';

import { getPlanNameByPriceId } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/client';
import { PlanSelector } from './plan-selector';

export default function UserSubscription() {
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const [isLoadingAuthUser, setIsLoadingAuthUser] = useState(true);
    const [isModalPlansOpen, setIsModalPlansOpen] = useState(false);
    const supabase = createClient();

    const {
        activeSubscription,
        isLoading: isLoadingSubscription,
        error: subscriptionError,
    } = useSubscriptionStore();

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingAuthUser(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setAuthUser(user);
            setIsLoadingAuthUser(false);
        };
        fetchUser();
    }, [supabase]);

    const formatDate = (date: Date | string) => {
        return format(new Date(date), 'dd MMMM yyyy', { locale: es });
    };

    const renderSubscriptionDetails = () => {
        if (isLoadingSubscription) {
            return <Skeleton className="h-16 w-full" />;
        }

        if (subscriptionError) {
            return (
                <div className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>Error al cargar la información de tu suscripción.</p>
                </div>
            );
        }

        if (!activeSubscription) return null;

        const planName = getPlanNameByPriceId(activeSubscription.price_id);
        const isTrialing = activeSubscription.status === 'trialing';
        const isActive = activeSubscription.status === 'active';

        return (
            <div className="space-y-2">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                    <div className="text-lg font-semibold flex items-center">
                        {planName}
                        <Badge variant={isActive ? 'default' : 'secondary'} className="ml-2">
                            {isTrialing
                                ? 'En prueba'
                                : isActive
                                ? 'Activo'
                                : activeSubscription.status}
                        </Badge>
                    </div>
                </div>
                {activeSubscription.current_period_end && (
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {isTrialing ? 'Finaliza prueba el' : 'Próxima renovación el'}
                        </p>
                        <p>{formatDate(activeSubscription.current_period_end)}</p>
                    </div>
                )}
                {activeSubscription.cancel_at_period_end && activeSubscription.cancel_at && (
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Se cancelará el</p>
                        <p className="text-destructive">
                            {formatDate(activeSubscription.cancel_at)}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mi Suscripción</CardTitle>
            </CardHeader>
            <CardContent>
                <div>{renderSubscriptionDetails()}</div>

                <p className="text-sm text-muted-foreground mb-4">
                    {activeSubscription ? 'Puedes ver y cambiar tu plan en cualquier momento.' : 'No tienes una suscripción activa.'}
                </p>
                <Dialog open={isModalPlansOpen} onOpenChange={setIsModalPlansOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <CreditCard className="mr-2 h-4 w-4" /> {
                                activeSubscription ? 'Cambiar Plan' : 'Ver planes'
                            }
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Selecciona tu Plan</DialogTitle>
                            <DialogDescription>
                                Elige el plan que mejor se adapte a tus necesidades.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto">
                            {authUser ? (
                                <PlanSelector user={authUser} source="profileModal" />
                            ) : (
                                <p>Cargando información del usuario...</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
