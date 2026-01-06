import LandingContent from '@/components/landing/landing-content';
import { LandingHeader } from '@/components/landing/header';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opositaplace | Tu plataforma de tests de oposiciones',
  description:
    'La mejor plataforma para preparar tus oposiciones. Tests ilimitados, seguimiento de progreso y planificación de estudio personalizada.',
  alternates: {
    canonical: 'https://www.opositaplace.es',
  },
  openGraph: {
    title: 'Opositaplace | Tu plataforma de tests de oposiciones',
    description:
      'La mejor plataforma para preparar tus oposiciones. Tests ilimitados, seguimiento de progreso y planificación de estudio personalizada.',
    url: 'https://www.opositaplace.es',
    siteName: 'Opositaplace',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Opositaplace Landing',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
};

export default async function LandingPage() {
  const { profile } = await getSessionData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Opositaplace',
    url: 'https://www.opositaplace.es',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.opositaplace.es/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader profile={profile} />
      <LandingContent />
    </>
  );
}
