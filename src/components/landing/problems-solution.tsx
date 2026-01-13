'use client';

import React from 'react';
import { AnimatedBeamSection } from './animated-beam-section';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { motion } from 'framer-motion';

interface ProblemCardProps {
  title: string;
  description: string;
  className?: string;
  variants?: any;
}

const ProblemCard = ({ title, description, className, variants }: ProblemCardProps) => (
  <motion.div
    variants={variants}
    className={cn(
      'p-6 rounded-2xl group border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all duration-300 ',
      className
    )}
  >
    <h3 className="text-xl font-bold mb-2 group-hover:text-primary text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-primary uppercase mb-4"
          >
            PROBLEMAS & SOLUCIÓN
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-3xl mx-auto font-playfair"
          >
            Pierde menos tiempo. Ahorra más dinero.
            <span className="text-primary"> Consigue tu plaza.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-6xl mx-auto">
          {/* Left Column: Problems */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            {problems.map((problem, index) => (
              <ProblemCard
                key={index}
                title={problem.title}
                description={problem.description}
                variants={itemVariants}
              />
            ))}
          </motion.div>

          {/* Middle: Vertical VS */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="hidden lg:flex flex-col items-center justify-center h-full py-12"
          >
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
            <span className="py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background z-10">
              VS
            </span>
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
          </motion.div>

          {/* Mobile VS */}
          <div className="flex lg:hidden items-center gap-4 my-8">
            <div className="h-px flex-grow bg-border" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              VS
            </span>
            <div className="h-px flex-grow bg-border" />
          </div>

          {/* Right Column: Solution (Animated Beam) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-1 md:p-8 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)]">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
