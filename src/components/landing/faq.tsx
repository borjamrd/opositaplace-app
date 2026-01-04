'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ArrowLeftRight, CreditCard, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

const faqs = [
  {
    id: 'item-1',
    question: '¿Es gratis?',
    subtitle: 'Plan gratuito disponible',
    answer:
      'En Opositaplace hay plan gratuito, en donde podrás realizar tests, visualizar bloques y temas y registrar tu estudio.',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 'item-2',
    question: '¿Qué sucede si tengo sólo tests o casos prácticos?',
    subtitle: 'Flexibilidad en tu suscripción',
    answer:
      'Puedes cambiar tu suscripción cuando quieras. Por ejemplo: si tu proceso tiene primero tests y después caso práctico, cuando apruebes el primer ejercicio cambias la suscripción para poder realizar los casos prácticos.',
    icon: <ArrowLeftRight className="w-5 h-5" />,
  },
  {
    id: 'item-3',
    question: '¿Utilizáis IA?',
    subtitle: 'IA como soporte, no como base',
    answer:
      'Sí, pero vemos la IA como un soporte al contenido, y no al revés. La inmensa mayoría de preguntas corresponden a exámenes reales.',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: 'item-4',
    question: 'Si realizo sugerencias, ¿quién responde?',
    subtitle: 'Atención personalizada',
    answer: 'No responde una IA, respondemos nosotros, con nombre y apellidos :)',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    id: 'item-5',
    question: '¿Recibiré SPAM si me registro?',
    subtitle: 'Privacidad garantizada',
    answer:
      'Para nada. Te enviaremos correos únicamente relacionados con tu suscripción, feedback y proceso selectivo. No habrá correos comerciales. Nunca.',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Side: Title & Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-start space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              Preguntas frecuentes
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Tendrás dudas, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                es normal
              </span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Encuentra respuestas a las dudas más comunes sobre Opositaplace y descubre cómo
              podemos ayudarte en tu camino hacia la plaza.
            </p>
          </motion.div>

          {/* Right Side: Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-white/10 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 group px-4 py-2"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center text-left gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                        {faq.icon}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-semibold group-data-[state=open]:text-primary transition-colors duration-300">
                          {faq.question}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                          {faq.subtitle}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pl-14 pb-6 pr-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
