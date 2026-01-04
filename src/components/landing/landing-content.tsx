'use client';

import { PlanSelector } from '../subscription/plan-selector';
import { CtaOpposition } from './cta-opposition';
import { FAQ } from './faq';
import { Features } from './features';
import { Footer } from './footer';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { ProblemsSolution } from './problems-solution';

export default function LandingContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <ProblemsSolution />
      <Features />
      <PlanSelector />
      <FAQ />
      <CtaOpposition />
      <Footer />
    </div>
  );
}
