'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { useOppositionStore } from '@/store/opposition-store';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptionStore } from '@/store/subscription-store';

export function SignOutButton() {
    const { clearSelectedOpposition } = useOppositionStore();
    const { clearActiveSubscription } = useSubscriptionStore();
    const queryClient = useQueryClient();

    const handleSignOut = async () => {
        clearSelectedOpposition();
        clearActiveSubscription();
        queryClient.invalidateQueries();
        await signOut();
    };
    return (
        <form action={() => handleSignOut()}>
            <Button variant="ghost" type="submit" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
        </form>
    );
}
