'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Meteors } from '../ui/meteors';
import { AvailableOppositionsDialog } from './available-oppositions-dialog';
import { Highlighter } from '@/components/ui/highlighter';

export function CtaOpposition() {
  return (
    <section className="py-20 relative overflow-hidden h-[500px]">
      <div className="container mx-auto px-4 text-center h-[500px]">
        <Meteors number={30} />
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Main Title */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-newsreader">
            Cuanto antes comiences,
            <Highlighter action="highlight" color="var(--primary)" delay={2000}>
              <span className="text-primary-foreground">mejor.</span>
            </Highlighter>
            .
          </h2>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              asChild
              variant="btn-header"
              className="h-14 px-10 text-xl rounded-xl shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <Link href="/register">Acceder</Link>
            </Button>
          </div>
          <AvailableOppositionsDialog />
        </div>
      </div>
    </section>
  );
}
