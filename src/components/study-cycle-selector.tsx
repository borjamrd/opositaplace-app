'use client';

import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useStudySessionStore } from '@/store/study-session-store';
import { Loader2 } from 'lucide-react';

const StudyCycleSelector = () => {
    const { studyCycles, activeStudyCycle, isLoadingCycles, selectStudyCycle } =
        useStudySessionStore();

    if (isLoadingCycles) {
        return (
            <div className="text-xs mt-1 flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" /> Cargando ciclos...
            </div>
        );
    }

    if (studyCycles.length === 0) {
        return <div className="text-xs mt-1">No hay ciclos de estudio.</div>;
    }

    return (
        <Select value={activeStudyCycle?.id || ''} onValueChange={selectStudyCycle}>
            <SelectTrigger>
                <SelectValue placeholder="Selecciona una vuelta" />
            </SelectTrigger>
            <SelectContent>
                {studyCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                        <div className="flex justify-between items-center w-full gap-3">
                            <span>Vuelta #{cycle.cycle_number}</span>
                            <Badge variant={cycle.completed_at ? 'secondary' : 'outline'}>
                                {cycle.completed_at ? 'Finalizado' : 'Activo'}
                            </Badge>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default StudyCycleSelector;
