'use client';

import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('./hero').then((mod) => mod.Hero));
const HowItWorks = dynamic(() => import('./how-it-works').then((mod) => mod.HowItWorks));
const ProblemsSolution = dynamic(() =>
  import('./problems-solution').then((mod) => mod.ProblemsSolution)
);
const Features = dynamic(() => import('./features').then((mod) => mod.Features));
const OfficialQuestions = dynamic(() =>
  import('./official-questions').then((mod) => mod.OfficialQuestions)
);
const LegislacionVigente = dynamic(() =>
  import('./legislacion-vigente').then((mod) => mod.LegislacionVigente)
);
const PlanSelector = dynamic(() =>
  import('../subscription/plan-selector').then((mod) => mod.PlanSelector)
);
const FAQ = dynamic(() => import('./faq').then((mod) => mod.FAQ));
const CtaOpposition = dynamic(() => import('./cta-opposition').then((mod) => mod.CtaOpposition));
const Footer = dynamic(() => import('./footer').then((mod) => mod.Footer));

export default function LandingContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <ProblemsSolution />
      <Features />
      <OfficialQuestions />
      <LegislacionVigente />
      <PlanSelector />
      <FAQ />
      <CtaOpposition />
      <Footer />
    </div>
  );
}
