'use client';

import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AvailableOppositionsDialog } from './available-oppositions-dialog';

export function Hero() {
  return (
    <section className="relative -mt-10 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-start space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Por ahora disponible para GACE</span>
            </motion.div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight font-playfair">
                En tu oposición,
                <br />
                <span className="italic">
                  <Highlighter action="highlight" color="var(--secondary)" delay={1200}>
                    estudia mejor
                  </Highlighter>
                </span>
                <br />
                con{' '}
                <Highlighter action="underline" color="var(--primary)" delay={2000}>
                  opositaplace
                </Highlighter>
                .
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Un solo lugar para registrar tu estudio, realizar ejercicios y estar al tanto de tu
                proceso selectivo.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center sm:items-start gap-4 w-full sm:w-auto">
              <Button
                asChild
                variant="btn-header"
                className="h-14 px-10 text-xl rounded-xl shadow-xl hover:shadow-primary/20 transition-all duration-300 w-full sm:w-auto"
              >
                <Link href="/register">Acceder</Link>
              </Button>

              <AvailableOppositionsDialog />
            </div>
          </motion.div>

          {/* Right Content - 3D Image Composition */}
          <div className="relative perspective-[2000px] h-[400px] md:h-[500px] w-full flex items-center justify-center">
            {/* Main Dashboard (Base) */}
            <motion.div
              initial={{ opacity: 0, rotateX: 20, rotateY: -20, scale: 0.8 }}
              animate={{ opacity: 1, rotateX: 5, rotateY: -5, scale: 1.35 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative z-10 w-full"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <img
                src="/roadmap_hero.png"
                alt="Roadmap Dashboard"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Floating Card 2 (Caso Práctico) - Bottom Left */}
            <motion.div
              initial={{ opacity: 0, y: 50, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1.15 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -left-10 -top-5 md:-left-25 md:top-40  md:w-full z-30"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/caso_practico_hero.png"
                  alt="Caso Práctico"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </motion.div>
            </motion.div>

            {/* Decorative Glows */}
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-3xl opacity-50 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
