'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionStore } from '@/store/subscription-store';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getPlanNameByPriceId } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSubscription } from '@/lib/supabase/queries/useUserSubscription';
import { useRouter } from 'next/navigation';

export default function UserSubscription() {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [isLoadingAuthUser, setIsLoadingAuthUser] = useState(true);
  const supabase = createClient();
  const { data: reactQuerySubscription, isLoading: isLoadingQuery } = useUserSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const handleManageSubscription = async () => {
    if (!authUser) {
      toast({
        title: 'Necesitas iniciar sesión',
        description: 'Por favor, inicia sesión para gestionar tu suscripción.',
        variant: 'default',
      });
      router.push('/login?redirect=/dashboard/profile');
      return;
    }
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const {
    subscription: activeSubscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    setSubscription,
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

  useEffect(() => {
    if (!isLoadingQuery && reactQuerySubscription !== undefined) {
      setSubscription(reactQuerySubscription);
    }
  }, [reactQuerySubscription, isLoadingQuery, setSubscription]);

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: es });
  };

  const renderSubscriptionDetails = () => {
    if (isLoadingSubscription || isLoadingQuery) {
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
              {isTrialing ? 'En prueba' : isActive ? 'Activo' : activeSubscription.status}
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
            <p className="text-destructive">{formatDate(activeSubscription.cancel_at)}</p>
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
          {activeSubscription
            ? 'Puedes ver y cambiar tu plan en cualquier momento.'
            : 'No tienes una suscripción activa.'}
        </p>
        <Button
          variant="outline"
          onClick={handleManageSubscription}
          disabled={isLoading || isLoadingAuthUser}
        >
          <CreditCard className="mr-2 h-4 w-4" />{' '}
          {activeSubscription
            ? isLoading
              ? 'Cargando...'
              : 'Gestionar suscripción'
            : isLoading
              ? 'Cargando...'
              : 'Ver planes'}
        </Button>
      </CardContent>
    </Card>
  );
}
