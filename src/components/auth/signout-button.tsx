'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useStudySessionStore } from '@/store/study-session-store'; // <-- Usamos el store unificado
import { useSubscriptionStore } from '@/store/subscription-store'; // <-- Asegúrate de añadirle un método 'reset' también

export function SignOutButton() {
    const resetSession = useStudySessionStore((state) => state.reset);
    const clearSubscription = useSubscriptionStore((state) => state.clearActiveSubscription);
    const queryClient = useQueryClient();

    const handleSignOut = async () => {
        resetSession();
        clearSubscription();
        queryClient.clear();
        await signOut();
    };

    return (
        <form action={handleSignOut}>
            <Button variant="ghost" type="submit" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
        </form>
    );
}
