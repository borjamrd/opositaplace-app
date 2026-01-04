'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Realiza el onboarding',
      description:
        'Planifica tu objetivo de horas semanales, asígnalos a un calendario y define tus preferencias.',
      image: '/onboarding.png',
    },
    {
      number: 2,
      title: 'Registra tu estudio',
      description:
        'Ya sea con pomodoro o de forma libre, registra tus horas de estudio y realiza los tests y casos prácticos.',
      image: '/sesion.png',
    },
    {
      number: 3,
      title: 'Dale vueltas al temario',
      description:
        'Recibe feedback sobre tu progreso y registra tu progreso en el roadmap con los bloques y temas.',
      image: '/roadmap.png',
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
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: 'easeOut',
                  },
                },
              }}
              className="group relative flex flex-col min-h-[400px] h-full bg-card/40 backdrop-blur-md rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative w-full h-64 overflow-hidden rounded-t-3xl bg-secondary/5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60 z-10 bottom-0 h-12" />
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Card Content */}
              <div className="relative z-20 p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
