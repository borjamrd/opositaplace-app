'use client';

import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from '@/registry/magicui/scroll-based-velocity';
import { Highlighter } from '../ui/highlighter';

export function LegislacionVigente() {
  return (
    <section className="py-20 relative max-w-sm md:container overflow-hidden bg-background">
      <div className="container px-4 md:px-6 mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-newsreader">
          Legislación{' '}
          <Highlighter action="highlight" color="var(--secondary)" delay={1000}>
            vigente
          </Highlighter>
        </h2>
        <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
          <Highlighter action="underline" color="var(--primary)" delay={1500}>
            Actualizada constantemente
          </Highlighter>{' '}
          para tu preparación
        </p>
      </div>
      <ScrollVelocityContainer className="text-xl font-bold tracking-tight md:text-4xl">
        <ScrollVelocityRow
          baseVelocity={-1}
          direction={1}
          className="mb-4 text-muted-foreground/80 hover:text-foreground transition-colors duration-300"
        >
          Constitución Española de 1978 — Ley 39/2015 Ley del Procedimiento Administrativo Común —
        </ScrollVelocityRow>
        <ScrollVelocityRow
          baseVelocity={1}
          direction={-1}
          className="mb-4 text-muted-foreground/80 hover:text-foreground transition-colors duration-300"
        >
          Ley 40/2015 Ley de Régimen Jurídico del Sector Público — Ley 9/2017 Ley de Contratos del
          Sector Público —
        </ScrollVelocityRow>
        <ScrollVelocityRow
          baseVelocity={-1}
          direction={1}
          className="mb-4 text-muted-foreground/80 hover:text-foreground transition-colors duration-300"
        >
          RDL 5/2015 Texto Refundido de la Ley del Estatuto Básico del Empleado — Ley 19/2013 Ley de
          Transparencia —
        </ScrollVelocityRow>
        <ScrollVelocityRow
          baseVelocity={1}
          direction={-1}
          className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300"
        >
          Ley 47/2003 Ley General Presupuestaria — Constitución Española de 1978 —
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent z-10"></div>
    </section>
  );
}
