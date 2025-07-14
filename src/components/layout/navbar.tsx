'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../logo';

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (_event !== 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase]);

    const HeaderContainer = ({ children }: { children: React.ReactNode }) => (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 md:px-10 flex h-14 items-center justify-between py-1">
                {children}
            </div>
        </header>
    );

    if (user) {
        return (
            <HeaderContainer>
                <Link href="/" className="flex items-center space-x-2">
                    <Logo />
                </Link>
                <nav className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    </div>
                </nav>
            </HeaderContainer>
        );
    }

    if (loading) {
        return (
            <HeaderContainer>
                <Link href="/" className="flex items-center space-x-2">
                    <Logo />
                </Link>
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
            </HeaderContainer>
        );
    }

    return (
        <HeaderContainer>
            <Link href="/" className="flex items-center space-x-2">
                <Logo />
            </Link>
            <nav className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild>
                        <Link href="/plans">Planes</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Inicia sesión</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Regístrate</Link>
                    </Button>
                </div>
            </nav>
        </HeaderContainer>
    );
}
