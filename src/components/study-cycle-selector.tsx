'use client';

import { useEffect } from "react";
import { useStudyCycles } from "@/lib/supabase/queries/useStudyCycles";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; //
import { Badge } from "@/components/ui/badge"; //
import { useStudyCycleStore } from "@/store/study-cycle-store";
import { Loader2 } from "lucide-react";

interface StudyCycleSelectorProps {
  oppositionId: string | null | undefined; // Permitir null o undefined
}

const StudyCycleSelector = ({ oppositionId }: StudyCycleSelectorProps) => {
  const { data: cycles, isLoading, error, refetch } = useStudyCycles(oppositionId);
  const { selectedCycleId, setSelectedCycleId } = useStudyCycleStore();

  // Efecto para seleccionar por defecto el ciclo activo o el primero
  useEffect(() => {
    if (cycles && cycles.length > 0) {
        // Solo intenta setear por defecto si no hay ya un ciclo seleccionado
        // Y si el ciclo seleccionado actualmente no está en la lista de ciclos actual (ej. cambió la oposición)
        const currentSelectionInList = cycles.find(c => c.id === selectedCycleId);
        if (!selectedCycleId || !currentSelectionInList) {
            const activeCycle = cycles.find((c) => !c.completed_at); // El que no tiene fecha de completado
            const defaultCycle = activeCycle ?? cycles[0]; // Si no hay activo, el primero
            if (defaultCycle) {
                setSelectedCycleId(defaultCycle.id);
            }
        }
    } else if (!isLoading && cycles && cycles.length === 0) {
        // Si no hay ciclos y no está cargando, limpiar la selección
        setSelectedCycleId(null);
    }
  }, [cycles, selectedCycleId, setSelectedCycleId, isLoading]);

  // Efecto para recargar ciclos si cambia oppositionId (ya manejado por el hook useStudyCycles)
  // pero podrías querer limpiar el selectedCycleId si el oppositionId cambia a null/undefined
  useEffect(() => {
    if (!oppositionId) {
      setSelectedCycleId(null);
    }
  }, [oppositionId, setSelectedCycleId]);


  const handleChange = (value: string) => {
    setSelectedCycleId(value);
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground mt-1 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/>Cargando ciclos...</div>;
  }

  if (error) {
    return <div className="text-xs text-destructive mt-1">Error al cargar ciclos.</div>;
  }

  if (!oppositionId) {
    return <div className="text-xs text-muted-foreground mt-1">Selecciona una oposición para ver los ciclos.</div>;
  }

  if (cycles && cycles.length === 0) {
    return (
      <div className="text-xs text-muted-foreground mt-1 text-center">
        No hay ciclos de estudio iniciados para esta oposición.
        {/* Podrías añadir un botón para "Iniciar primer ciclo" si tiene sentido */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mt-1"> {/* Ajustado max-w-sm a max-w-xs si es muy ancho */}
      {cycles && cycles.length > 0 ? (
        <Select
          value={selectedCycleId || ""} // Si es null, Select puede mostrar el placeholder
          onValueChange={handleChange}
          disabled={isLoading}
        >
          <SelectTrigger className="text-xs px-2 h-8"> {/* Ajustado padding y altura */}
            <SelectValue placeholder="Selecciona una vuelta" />
          </SelectTrigger>
          <SelectContent>
            {cycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                <div className="flex justify-between items-center w-full">
                  <span>Vuelta #{cycle.cycle_number}</span>
                  <Badge
                    variant={cycle.completed_at ? "secondary" : "default"}
                    className="ml-2 text-[10px] px-1.5 py-0.5" // Ajustado tamaño de Badge
                  >
                    {cycle.completed_at ? "Finalizado" : "Activo"}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
};

export default StudyCycleSelector;