"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudySessionStore } from "@/store/study-session-store";
import { Loader2 } from "lucide-react";
import StudyCycleSelector from "./study-cycle-selector"; // Lo simplificaremos a continuación

const OpositionSelector = () => {
  const { 
    oppositions, 
    activeOpposition, 
    isLoadingOppositions, 
    selectOpposition 
  } = useStudySessionStore();

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
      <Select
        onValueChange={(id) => selectOpposition(id)}
        value={activeOpposition?.id || ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una oposición" />
        </SelectTrigger>
        <SelectContent>
          {oppositions.map((oppo) => (
            <SelectItem key={oppo.id} value={oppo.id}>
              {oppo.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {activeOpposition && <StudyCycleSelector />}
    </div>
  );
};

export default OpositionSelector;