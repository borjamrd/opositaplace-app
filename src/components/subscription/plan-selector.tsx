// src/components/subscription/PlanSelector.tsx
'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagicCard } from '@/components/ui/magic-card';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface PlanSelectorProps {}

export function PlanSelector({}: PlanSelectorProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {STRIPE_PLANS.map((plan, index) => (
              <MagicCard
                gradientColor={'var(--border)'}
                className="p-0 rounded-2xl"
                key={plan.name}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-3xl font-bold mb-6">{plan.price}</p>
                  <ul className="space-y-4 text-left">
                    {plan.features.map((feature) => {
                      const isExisting = STRIPE_PLANS.slice(0, index).some((p) =>
                        p.features.some((f) => f.label === feature.label)
                      );

                      return (
                        <li
                          key={feature.label}
                          className={`text-sm ${
                            feature.isBeta
                              ? 'bg-primary/10 border border-primary/20 rounded-lg p-3 -mx-3'
                              : 'flex items-center'
                          }`}
                        >
                          {feature.isBeta ? (
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-primary to-primary/20 rounded-md p-1.5 shrink-0 shadow-sm mt-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">
                                    {feature.label}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-primary/20 text-white px-1.5 py-0.5 rounded-full shadow-sm">
                                    Beta
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <CheckCircle
                                className={`w-4 h-4 me-3 mr-2 flex-shrink-0 ${
                                  isExisting ? 'text-muted-foreground/50' : 'text-green-500'
                                }`}
                              />
                              <span className={isExisting ? 'text-muted-foreground' : ''}>
                                {feature.label}
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
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
      </div>
    </section>
  );
}
