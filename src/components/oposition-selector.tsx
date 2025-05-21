"use client";

import {
  useOppositionStore,
  type OppositionBase,
} from "@/store/opposition-store"; // Asumo que la ruta es correcta
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button"; // Asumo que está en el mismo directorio
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types"; //
import { Loader2 } from "lucide-react"; // Añadir Loader2
import StudyCycleSelector from "./study-cycle-selector";

async function fetchUserSubscribedOppositions(
  userId: string
): Promise<OppositionBase[]> {
  console.log("fetchUserSubscribedOppositions called with userId:", userId);
  const supabase = createClient();
  const { data: userOppositionsData, error: userOppositionsError } =
    await supabase
      .from("user_oppositions")
      .select(
        `
      active,
      opposition_id,
      oppositions (
        id,
        name,
        description
      )
    `
      )
      .eq("profile_id", userId);

  if (userOppositionsError) {
    console.error("Error fetching user_oppositions:", userOppositionsError);
    return [];
  }

  console.log("Raw data from user_oppositions:", userOppositionsData);

  if (!userOppositionsData || userOppositionsData.length === 0) {
    console.log("No user_oppositions data found for this user.");
    return [];
  }

  // Mapear para obtener la estructura OppositionBase
  const mappedOppositions = userOppositionsData
    .filter((uo) => {
      // Loguear cada item antes de filtrar
      // console.log("Filtering user_opposition item:", uo);
      // console.log("  - uo.oppositions:", uo.oppositions);
      // console.log("  - uo.active:", uo.active);
      const hasOppositionData = uo.oppositions !== null;
      const isActiveOrNull = uo.active === true || uo.active === null; // OJO: si active es false, se filtra
      // console.log("  - hasOppositionData:", hasOppositionData, "isActiveOrNull:", isActiveOrNull);
      return hasOppositionData && isActiveOrNull;
    })
    .map((uo) => uo.oppositions as OppositionBase) // Sabemos por el filtro anterior que uo.oppositions no es null
    .filter((op) => op !== null); // Este filtro es redundante si el anterior ya asegura uo.oppositions !== null

  console.log("Mapped and filtered oppositions:", mappedOppositions);
  return mappedOppositions;
}

const OpositionSelector = () => {
  const { activeOpposition, setActiveOpposition } = useOppositionStore();
  const [userSubscribedOppositions, setUserSubscribedOppositions] = useState<
    OppositionBase[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("OpositionSelector: Component mounted/updated");
    const supabase = createClient();
    const getUser = async () => {
      console.log("OpositionSelector: Getting user...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error("OpositionSelector: Error getting user:", authError);
      }
      console.log("OpositionSelector: User fetched:", user);
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    console.log(
      "OpositionSelector: userId effect triggered. Current userId:",
      userId
    );
    if (userId) {
      setIsLoading(true);
      console.log(
        "OpositionSelector: Fetching subscribed oppositions for userId:",
        userId
      );
      fetchUserSubscribedOppositions(userId)
        .then((data) => {
          console.log(
            "OpositionSelector: Subscribed oppositions fetched:",
            data
          );
          setUserSubscribedOppositions(data);
          if (
            data.length > 0 &&
            !useOppositionStore.getState().activeOpposition
          ) {
            console.log(
              "OpositionSelector: Setting active opposition to first in list:",
              data[0]
            );
            setActiveOpposition(data[0]);
          } else if (data.length === 0) {
            console.log(
              "OpositionSelector: No oppositions found for user, clearing active opposition."
            );
            // Si no hay oposiciones, y la regla es "siempre tiene una", esto es un problema
            // Pero si es posible que no tenga, limpiar la activa es correcto.
            // setActiveOpposition(null); // Considera si esto es necesario o si el dashboard lo manejará
          }
        })
        .catch((fetchError) => {
          console.error(
            "OpositionSelector: Error in fetchUserSubscribedOppositions promise chain:",
            fetchError
          );
        })
        .finally(() => {
          console.log("OpositionSelector: Finished loading oppositions.");
          setIsLoading(false);
        });
    } else {
      console.log(
        "OpositionSelector: No userId, clearing subscribed oppositions and stopping load."
      );
      setUserSubscribedOppositions([]);
      setIsLoading(false); // Asegúrate que isLoading se ponga a false aquí también
    }
  }, [userId, setActiveOpposition]);

  const handleOppositionChange = (selectedOppositionId: string) => {
    console.log(
      "OpositionSelector: handleOppositionChange:",
      selectedOppositionId
    );
    const selectedOp = userSubscribedOppositions.find(
      (op) => op.id === selectedOppositionId
    );
    if (selectedOp) {
      console.log(
        "OpositionSelector: Setting new active opposition:",
        selectedOp
      );
      setActiveOpposition(selectedOp);
    } else {
      console.warn(
        "OpositionSelector: Selected opposition ID not found in subscribed list:",
        selectedOppositionId
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 mb-2 px-2 text-sm text-muted-foreground flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Cargando oposiciones...
      </div>
    );
  }

  // Este bloque se muestra si el usuario está logueado (userId existe) PERO no tiene oposiciones
  if (userId && userSubscribedOppositions.length === 0) {
    console.log(
      "OpositionSelector: Rendering 'No tienes oposiciones asignadas.'"
    );
    return (
      <div className="mt-4 mb-2 px-2">
        <p className="text-sm text-muted-foreground mb-2">
          No tienes oposiciones asignadas.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/oposiciones">Gestionar Oposiciones</Link>
        </Button>
      </div>
    );
  }

  // Si no hay usuario logueado, no mostrar nada (o un placeholder/mensaje diferente)
  if (!userId) {
    console.log("OpositionSelector: No user ID, rendering null.");
    return null;
  }

  // Solo mostrar el selector si hay oposiciones Y una oposición activa
  // O si hay oposiciones y activeOpposition es null para permitir la primera selección
  if (userSubscribedOppositions.length > 0 && activeOpposition) {
    console.log(
      "OpositionSelector: Rendering Select with activeOpposition:",
      activeOpposition
    );
    return (
      <div className="mt-4 mb-2 px-2">
        <div className="flex flex-col gap-2">
          <Select
            onValueChange={handleOppositionChange}
            value={activeOpposition.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una oposición">
                {activeOpposition.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userSubscribedOppositions.map((oppo) => (
                <SelectItem key={oppo.id} value={oppo.id}>
                  {oppo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeOpposition.id && (
            <div>
              <StudyCycleSelector oppositionId={activeOpposition.id} />
            </div>
          )}
        </div>
      </div>
    );
  } else if (userSubscribedOppositions.length > 0 && !activeOpposition) {
    console.log(
      "OpositionSelector: Oposiciones disponibles pero ninguna activa en el store (debería seleccionarse la primera)."
    );
    // Esto podría ser un estado transitorio antes de que el useEffect setee la primera.
    // O si el useEffect falla en setearla por alguna razón.
    return (
      <div className="mt-4 mb-2 px-2 text-sm text-muted-foreground">
        Configurando oposición activa...
      </div>
    );
  }

  // Fallback si algo más falla y no entra en los casos anteriores.
  console.log(
    "OpositionSelector: Fallback, rendering 'Selecciona tu oposición.' (Este caso debería ser raro)."
  );
  return (
    <p className="mt-4 mb-2 px-2 text-sm text-muted-foreground">
      Selecciona tu oposición.
    </p>
  );
};

export default OpositionSelector;
