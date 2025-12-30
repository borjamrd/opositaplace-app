'use client';

import { BarChart3, BookOpen, CalendarCheck } from 'lucide-react';
import { PlanSelector } from '../subscription/plan-selector';
import { CtaOpposition } from './cta-opposition';
import { FAQ } from './faq';
import { Features } from './features';
import { Footer } from './footer';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { ProblemsSolution } from './problems-solution';

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
      <Features />
      <PlanSelector />
      <CtaOpposition />
      <FAQ />
      <Footer />
    </div>
  );
}
