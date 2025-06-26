'use client';

import { signOut } from '@/actions/auth';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useStudySessionStore } from '@/store/study-session-store';
import { useTimerStore } from '@/store/timer-store';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function SignOutButton() {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const resetSession = useStudySessionStore((state) => state.reset);
    const clearSubscription = useSubscriptionStore((state) => state.clearActiveSubscription);
    const queryClient = useQueryClient();

    const { isActive, saveSessionAndReset, reset: resetTimer } = useTimerStore();

    const performSignOut = async () => {
        setIsSigningOut(true);
        resetSession();
        clearSubscription();
        queryClient.clear();
        await signOut();
    };

    const handleSignOutClick = () => {
        if (isActive) {
            setIsConfirming(true);
        } else {
            performSignOut();
        }
    };
    
    // Acción para guardar la sesión y luego salir
    const handleSaveAndSignOut = async () => {
        setIsConfirming(false);
        await saveSessionAndReset();
        await performSignOut();
    };

    // Acción para descartar la sesión y luego salir
    const handleDiscardAndSignOut = async () => {
        setIsConfirming(false);
        resetTimer(); 
        await performSignOut();
    };

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} 
                onClick={handleSignOutClick}
                disabled={isSigningOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
                {isSigningOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>Cerrar Sesión</span>
            </DropdownMenuItem>

            <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Sesión de estudio activa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hemos detectado que tienes un temporizador de estudio en curso. ¿Qué deseas hacer con el tiempo registrado antes de salir?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <Button variant="outline" onClick={handleDiscardAndSignOut}>
                            Salir sin guardar
                        </Button>
                        <AlertDialogAction onClick={handleSaveAndSignOut}>
                            Guardar y Salir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}