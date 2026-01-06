'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Meteors } from '../ui/meteors';
import { AvailableOppositionsDialog } from './available-oppositions-dialog';

const roles = ['GACE'];

export function CtaOpposition() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % roles.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden h-[500px]">
      <div className="container mx-auto px-4 text-center h-[500px]">
        <Meteors number={30} />
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Main Title */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Cuanto antes comiences, mejor.
          </h2>

          {/* Subtitle with Text Flip */}
          <div className="text-xl md:text-3xl text-muted-foreground flex flex-col items-center justify-center gap-2 md:gap-3 h-20 md:h-auto">
            <span>Me quiero preparar para</span>
            <div className="relative text-6xl h-20 w-full w-auto min-w-[300px] flex justify-center overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={roles[currentIndex]}
                  initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute text-primary font-semibold whitespace-nowrap"
                >
                  {roles[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

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
