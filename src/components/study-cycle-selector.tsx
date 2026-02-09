// src/components/study-cycle-selector.tsx
'use client';
import { getActiveStudyCycle, getStudyCycles } from '@/actions/roadmap';
import { StudyCycle } from '@/lib/supabase/types';
import { useEffect, useState } from 'react';

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
  const { selectStudyCycle } = useStudySessionStore();
  const [cycles, setCycles] = useState<StudyCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<StudyCycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cyclesData, activeCycleData] = await Promise.all([
          getStudyCycles(),
          getActiveStudyCycle(),
        ]);
        setCycles(cyclesData);
        setActiveCycle(activeCycleData);

        // Sync with store to ensure consistency across the app
        if (activeCycleData) {
          selectStudyCycle(activeCycleData.id);
        }
      } catch (error) {
        console.error('Error fetching study cycles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectStudyCycle]);

  const handleValueChange = (cycleId: string) => {
    const selected = cycles.find((c) => c.id === cycleId) || null;
    setActiveCycle(selected);
    selectStudyCycle(cycleId);
  };

  if (loading) {
    return (
      <div className="text-xs mt-1 flex items-center text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin mr-1" /> Cargando ciclos...
      </div>
    );
  }

  if (!cycles || cycles.length === 0) {
    return <div className="text-xs mt-1 text-muted-foreground">No hay ciclos de estudio.</div>;
  }

  return !collapsed ? (
    <Select value={activeCycle?.id || ''} onValueChange={handleValueChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder="Selecciona una vuelta" />
      </SelectTrigger>
      <SelectContent>
        {cycles.map((cycle) => (
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
        <Button variant="outline">{activeCycle?.cycle_number}</Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5}>
        <p>Estás en la {activeCycle?.cycle_number} vuelta al temario</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default StudyCycleSelector;
