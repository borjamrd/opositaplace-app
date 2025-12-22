// src/components/study-cycle-selector.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudySessionStore } from '@/store/study-session-store';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

const StudyCycleSelector = ({ collapsed }: { collapsed: boolean | undefined }) => {
  const { studyCycles, activeStudyCycle, isLoadingCycles, selectStudyCycle } =
    useStudySessionStore();

  if (isLoadingCycles) {
    return (
      <div className="text-xs mt-1 flex items-center text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin mr-1" /> Cargando ciclos...
      </div>
    );
  }

  if (!studyCycles || studyCycles.length === 0) {
    return <div className="text-xs mt-1 text-muted-foreground">No hay ciclos de estudio.</div>;
  }

  return !collapsed ? (
    <Select value={activeStudyCycle?.id || ''} onValueChange={selectStudyCycle}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder="Selecciona una vuelta" />
      </SelectTrigger>
      <SelectContent>
        {studyCycles.map((cycle) => (
          <SelectItem key={cycle.id} value={cycle.id}>
            <div className="flex justify-between items-center w-full gap-3">
              <span>Vuelta {cycle.cycle_number}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    //tooltip from shadcn
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">{activeStudyCycle?.cycle_number}</Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5}>
        <p>Estás en la {activeStudyCycle?.cycle_number} vuelta al temario</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default StudyCycleSelector;
