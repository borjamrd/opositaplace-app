import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/navbar';
import Providers from '@/components/providers/providers';
import { StateHydrator } from '@/components/state-hydrator';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';
export const metadata: Metadata = {
    title: 'Opositaplace - Por opositores, para opositores',
    description:
        'Organiza tu estudio, realiza tests, sigue tu progreso y consigue tu plaza con Opositaplace.',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {
        profile,
        subscription,
        userOppositions,
        activeOpposition,
        studyCycles,
        activeStudyCycle,
    } = await getSessionData();
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
            >
                <StateHydrator
                    profile={profile}
                    subscription={subscription}
                    userOppositions={userOppositions}
                    activeOpposition={activeOpposition}
                    studyCycles={studyCycles}
                    activeStudyCycle={activeStudyCycle}
                />
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
