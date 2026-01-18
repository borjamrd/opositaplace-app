'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Highlighter } from '../ui/highlighter';

export function OfficialQuestions() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={ref} className="py-20 md:py-32 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Left Side - Text */}
          <div className="space-y-6 md:col-span-1">
            <h2 className="text-3xl md:text-5xl font-bold font-newsreader leading-tight">
              Repasa con{' '}
              <span className="italic">
                <Highlighter action="highlight" color="var(--secondary)" delay={200}>
                  preguntas reales
                </Highlighter>
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sabemos que la mejor forma de prepararse es enfrentándose a la realidad. Por eso,
              nuestra base de datos está compuesta por preguntas extraídas directamente de
              convocatorias oficiales de años anteriores. Entrena con el formato, la dificultad y el
              estilo real del examen.
            </p>
          </div>

          {/* Right Side - Image */}
          <motion.div style={{ y, opacity }} className="relative flex justify-center md:col-span-2">
            <img
              src="/revision_hero.png"
              alt="Preguntas de exámenes oficiales"
              className="w-full max-w-4xl h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
