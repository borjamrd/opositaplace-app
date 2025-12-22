// src/components/subscription/PlanSelector.tsx
'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagicCard } from '@/components/ui/magic-card';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface PlanSelectorProps {}

export function PlanSelector({}: PlanSelectorProps) {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {STRIPE_PLANS.map((plan) => (
          <MagicCard gradientColor={'var(--border)'} className="p-0 rounded-2xl" key={plan.name}>
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
          </MagicCard>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Button
          asChild
          variant="btn-header"
          className="h-14 px-10 text-xl rounded-xl shadow-xl hover:shadow-primary/20 transition-all duration-300"
        >
          <Link href="/register">
            Comienza ya <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
