// src/components/subscription/PlanSelector.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STRIPE_PLANS, StripePlan } from '@/lib/stripe/config';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface PlanSelectorProps {}

export function PlanSelector({}: PlanSelectorProps) {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {STRIPE_PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.type === StripePlan.BASIC ? 'border-2 border-primary shadow-xl' : ''
            }`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-start text-sm">
                    <CheckCircle className="w-4 h-4 me-3 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        asChild
        className="shadow-lg mt-8 hover:shadow-primary/30 transition-shadow"
      >
        <Link href="/register">
          Crear tu cuenta gratis <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
