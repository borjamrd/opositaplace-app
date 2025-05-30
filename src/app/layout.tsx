import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/navbar';
import Providers from '@/components/providers/providers';

export const metadata: Metadata = {
    title: 'OpositaPlace - Tu preparación para oposiciones',
    description:
        'Organiza tu estudio, sigue tu progreso y alcanza tus metas en las oposiciones con OpositaPlace.',
};

export default function RootLayout({
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
                    <main className="flex-1">
                        <Navbar />
                        {children}
                    </main>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
