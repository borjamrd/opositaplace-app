import Providers from '@/components/providers/providers';
import { Toaster } from '@/components/ui/toaster';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Opositaplace - Por opositores, para opositores',
  description:
    'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
  metadataBase: new URL('https://www.opositaplace.com'),
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
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.opositaplace.com',
    title: 'Opositaplace - Por opositores, para opositores',
    description:
      'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
    siteName: 'Opositaplace',
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
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
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
    </html>
  );
}
