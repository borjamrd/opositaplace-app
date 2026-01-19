'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, StripePlan } from '@/lib/stripe/config';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextTestDate: Date | null;
  reason?: string;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  nextTestDate,
  reason,
}: LimitReachedModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
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

  const paidPlans = STRIPE_PLANS.filter((p) => p.type !== StripePlan.FREE);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            {reason ? 'Funcionalidad Premium' : 'Límite semanal alcanzado'}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {reason ? (
              <span className="block mb-2 text-foreground/90">{reason}</span>
            ) : (
              <>
                Has alcanzado el límite de 1 test semanal de tu plan gratuito.
                {nextTestDate && (
                  <span className="block mt-1 font-medium text-foreground">
                    Podrás realizar tu próximo test el{' '}
                    {nextTestDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    .
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Mejora tu plan para eliminar los límites</h3>
            <div className={`grid sm:grid-cols-${paidPlans.length} gap-4`}>
              {paidPlans.map((plan) => (
                <div key={plan.type} className="space-y-2">
                  <div className="font-medium text-primary">{plan.name}</div>
                  <ul className="text-sm space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Entendido
          </Button>
          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ver planes y mejorar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
