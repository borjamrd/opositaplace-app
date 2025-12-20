'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Escoge tu oposicion',
      description: 'Selecciona entre las opciones disponibles, si no encuentras la tuya nos dices.',
      imageColor: 'from-primary/20 to-primary/5',
    },
    {
      number: 2,
      title: 'Registra tu objetivo semanal',
      description:
        'Te recomendaremos un mínimo de horas, pero siempre puedes configuralo según tu situación.',
      imageColor: 'from-primary/30 to-primary/10',
    },
    {
      number: 3,
      title: 'Practica y reevalúa',
      description:
        'Registra tus horas de estudio, realiza los ejercicios y obtén feedback sobre tu progreso.',
      imageColor: 'from-primary/20 to-primary/5',
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block"
            >
              COMO FUNCIONA
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              Cómo será tu proceso.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              Gestiona en el onboarding tus preferencias y calendario, nosotros nos encargamos de lo
              demás.
            </p>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="group relative flex flex-col min-h-[400px] h-full bg-card/40 backdrop-blur-md rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden"
            >
              {/* Full Background Image Placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.imageColor} z-0 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="flex items-center justify-center h-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <Logo collapsed className="w-1/4" />
                </div>

                {/* Decorative glowing dots */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/40 rounded-full blur-sm" />
                <div className="absolute bottom-24 left-12 w-3 h-3 bg-primary/20 rounded-full blur-md" />
              </div>

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

              {/* Card Content */}
              <div className="relative z-20 p-8 mt-auto flex flex-col h-full justify-end">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
