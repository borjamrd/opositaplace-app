import Providers from '@/components/providers/providers';
import { Toaster } from '@/components/ui/toaster';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Newsreader } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import { Analytics } from '@vercel/analytics/next';
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader' });
const isProduction =
  process.env.VERCEL_ENV === 'production' &&
  process.env.NEXT_PUBLIC_SITE_URL !== 'https://opositaplace-staging.vercel.app';

export const metadata: Metadata = {
  title: 'Opositaplace - Por opositores, para opositores',
  description:
    'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
  metadataBase: new URL('https://www.opositaplace.es'),
  keywords: [
    'oposiciones',
    'test',
    'estudio',
    'planificador',
    'opositores',
    'exámenes',
    'organización',
  ],
  authors: [{ name: 'Opositaplace Team' }],
  creator: 'Opositaplace',
  publisher: 'Opositaplace',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.opositaplace.es',
    title: 'Opositaplace - Por opositores, para opositores',
    description:
      'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
    siteName: 'Opositaplace',
  },
  robots: {
    index: isProduction,
    follow: isProduction,
    googleBot: {
      index: isProduction,
      follow: isProduction,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opositaplace - Por opositores, para opositores',
    description:
      'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
    creator: '@opositaplace',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
      >
        <Providers>
          <NextTopLoader
            color="var(--primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
          />
          <main className="flex-1">{children}</main>
          <Toaster />
        </Providers>
      </body>
      <Analytics />
    </html>
  );
}
