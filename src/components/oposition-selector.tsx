'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStudySessionStore } from '@/store/study-session-store';
import { Loader2 } from 'lucide-react';
import StudyCycleSelector from './study-cycle-selector';

const OpositionSelector = () => {
    const { oppositions, activeOpposition, isLoadingOppositions, selectOpposition } =
        useStudySessionStore();

    if (isLoadingOppositions) {
        return (
            <div className="mt-4 px-2 text-sm flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando...
            </div>
        );
    }

    if (oppositions.length === 0) {
        return <p className="mt-4 px-2 text-sm">No tienes oposiciones.</p>;
    }

    return (
        <div className="mt-4 px-2 flex flex-col gap-2">
            <DropdownMenu dir="ltr">
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-between w-full h-fit whitespace-pre-line text-left"
                    >
                        {activeOpposition ? activeOpposition.name : 'Selecciona una oposición'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                    {oppositions.map((oppo) => (
                        <DropdownMenuItem
                            key={oppo.id}
                            onClick={() => selectOpposition(oppo.id)}
                            className={
                                activeOpposition?.id === oppo.id ? 'font-semibold bg-accent/50' : ''
                            }
                        >
                            {oppo.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {activeOpposition && <StudyCycleSelector />}
        </div>
    );
};

export default OpositionSelector;
