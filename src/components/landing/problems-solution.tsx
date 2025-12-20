'use client';

import React from 'react';
import { AnimatedBeamSection } from './animated-beam-section';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

interface ProblemCardProps {
  title: string;
  description: string;
  className?: string;
}

const ProblemCard = ({ title, description, className }: ProblemCardProps) => (
  <div
    className={cn(
      'p-6 rounded-2xl group border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all duration-300 ',
      className
    )}
  >
    <h3 className="text-xl font-bold mb-2 group-hover:text-primary text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export function ProblemsSolution() {
  const problems = [
    {
      title: 'Pierdes tiempo en muchas webs',
      description:
        'Acceder a múltiples enlaces para saber en qué estado está tu proceso selectivo es frustrante y poco eficiente.',
    },
    {
      title: 'Muchas plataformas = mucho dinero',
      description:
        'Acceder a tests, generadores de resúmenes y planificadores por separado hace que pierdas tiempo y dinero en diferentes suscripciones.',
    },
    {
      title: 'Falta de contexto',
      description:
        'Cada situación es particular, y la mayoría de herramientas de estudio no tienen en cuenta tu contexto específico.',
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h4 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">
            PROBLEMAS & SOLUCIÓN
          </h4>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-3xl mx-auto">
            Pierde menos tiempo. Ahorra más dinero.
            <span className="text-primary"> Consigue tu plaza.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-6xl mx-auto">
          {/* Left Column: Problems */}
          <div className="flex flex-col gap-6">
            {problems.map((problem, index) => (
              <ProblemCard key={index} title={problem.title} description={problem.description} />
            ))}
          </div>

          {/* Middle: Vertical VS */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full py-12">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
            <span className="py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background z-10">
              VS
            </span>
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Mobile VS */}
          <div className="flex lg:hidden items-center gap-4 my-8">
            <div className="h-px flex-grow bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              VS
            </span>
            <div className="h-px flex-grow bg-border" />
          </div>

          {/* Right Column: Solution (Animated Beam) */}
          <div className="relative">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 md:p-8 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

              {/* Logo header inside the box */}
              <div className="flex items-center justify-center mb-6 relative z-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-background/50 backdrop-blur-md">
                  <Logo className="w-6 h-6" collapsed />
                  <span className="font-bold text-primary text-sm tracking-tight">
                    opositaplace
                  </span>
                </div>
              </div>

              <AnimatedBeamSection />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
