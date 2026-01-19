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
import { Check, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { handleManageSubscription as manageSubscription } from '@/lib/stripe/client';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumFeatureModal({
  isOpen,
  onClose,
  featureName = 'Esta funcionalidad',
}: PremiumFeatureModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    await manageSubscription(setIsLoading, toast);
  };

  const proPlan = STRIPE_PLANS.find((p) => p.type === StripePlan.PRO);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Funcionalidad Premium
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {featureName} es exclusiva para usuarios del <strong>Plan Avanzado</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 text-primary">
              Consigue acceso total con el Plan Avanzado
            </h3>
            {proPlan && (
              <div className="space-y-2">
                <div className="font-medium text-primary">{proPlan.name}</div>
                <ul className="text-sm space-y-1">
                  {proPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            Mejorar mi plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
