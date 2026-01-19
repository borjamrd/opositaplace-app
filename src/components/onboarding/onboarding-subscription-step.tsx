import { Check, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STRIPE_PLANS, StripePlan } from '@/lib/stripe/config';

interface OnboardingSubscriptionStepProps {
  selectedPlan: 'free' | 'trial';
  onSelectPlan: (plan: 'free' | 'trial') => void;
}

export default function OnboardingSubscriptionStep({
  selectedPlan,
  onSelectPlan,
}: OnboardingSubscriptionStepProps) {
  const freePlan = STRIPE_PLANS.find((p) => p.type === StripePlan.FREE);
  const proPlan = STRIPE_PLANS.find((p) => p.type === StripePlan.PRO);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Elige cómo quieres empezar</h2>
        <p className="text-muted-foreground">
          Puedes cambiar de plan en cualquier momento desde tu perfil.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {/* PLAN GRATUITO */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2 relative hover:border-primary/50',
            selectedPlan === 'free' ? 'border-primary bg-primary/5' : 'border-border'
          )}
          onClick={() => onSelectPlan('free')}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Gratis</span>
              <span className="text-xl font-bold">0€</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {freePlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> {feature.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* PLAN PRO TRIAL */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2 relative hover:border-primary/50',
            selectedPlan === 'trial' ? 'border-primary bg-primary/5 shadow-md' : 'border-border'
          )}
          onClick={() => onSelectPlan('trial')}
        >
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Recomendado
            </span>
          </div>
          <CardHeader>
            <CardTitle className="flex flex-col">
              <div className=" flex justify-between items-center">
                <span>Pro (Prueba 3 días)</span>
                <span className="text-xl font-bold">Gratis 3 días</span>
              </div>
              <p className="text-xs text-muted-foreground font-normal italic font-sans">
                Sin tarjeta de crédito. Al finalizar pasas al plan gratuito.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {proPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{' '}
                  {index === 0 ? <strong>{feature.label}</strong> : feature.label}
                </li>
              ))}
            </ul>
            <div className="bg-primary/10 p-2 rounded-md text-xs text-muted-foreground font-normal italic font-sans">
              Al finalizar los 3 días recibirás un correo para suscribirte de nuevo si lo deseas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
