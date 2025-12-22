'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, BookOpen, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { PlanSelector } from '../subscription/plan-selector';
import { FAQ } from './faq';
import { Footer } from './footer';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { ProblemsSolution } from './problems-solution';
import { CtaOpposition } from './cta-opposition';

export default function LandingContent() {
  const features = [
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      title: 'Planificación Personalizada',
      description: 'Crea planes de estudio adaptados a tu ritmo y temario.',
      link: '#',
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: 'Seguimiento de Progreso',
      description: 'Visualiza tu avance y identifica áreas de mejora.',
      link: '#',
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: 'Material de Estudio Centralizado',
      description: 'Accede y organiza tu material de estudio en un solo lugar.',
      link: '#',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />

      <ProblemsSolution />

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Todo lo que necesitas para <span className="text-primary">aprobar</span>
          </h2>
          <p className="text-center text-foreground/70 max-w-2xl mx-auto mb-16 text-lg">
            Descubre las herramientas que te ayudarán a optimizar tu preparación y conseguir tu
            plaza.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-foreground/70 flex-grow">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <PlanSelector />
        </div>
      </section>

      <CtaOpposition />
      <FAQ />
      <Footer />
    </div>
  );
}
