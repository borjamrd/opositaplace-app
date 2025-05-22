"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  useOppositionStore,
  type OppositionBase,
} from "@/store/opposition-store";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import StudyCycleSelector from "./study-cycle-selector";
import { Button } from "./ui/button";

async function fetchUserSubscribedOppositions(
  userId: string
): Promise<OppositionBase[]> {
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

  if (!userOppositionsData || userOppositionsData.length === 0) {
    return [];
  }

  const mappedOppositions = userOppositionsData
    .filter((uo) => {
      const hasOppositionData = uo.oppositions !== null;
      const isActiveOrNull = uo.active === true || uo.active === null;
      return hasOppositionData && isActiveOrNull;
    })
    .map((uo) => uo.oppositions as OppositionBase);

  return mappedOppositions;
}

const OpositionSelector = () => {
  const { activeOpposition, setActiveOpposition } = useOppositionStore();
  const [userSubscribedOppositions, setUserSubscribedOppositions] = useState<
    OppositionBase[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const getUser = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      console.error("Error getting user:", authError);
    }
    setUserId(user?.id || null);
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const fetchAndSetActiveOpposition = useCallback(
    async (uid: string) => {
      setIsLoading(true);
      try {
        const data = await fetchUserSubscribedOppositions(uid);
        setUserSubscribedOppositions(data);
        if (data.length > 0 && !activeOpposition) {
          setActiveOpposition(data[0]);
        }
      } catch (fetchError) {
        console.error(
          "Error in fetchUserSubscribedOppositions promise chain:",
          fetchError
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setActiveOpposition, activeOpposition]
  );

  useEffect(() => {
    if (userId) {
      fetchAndSetActiveOpposition(userId);
    } else {
      setUserSubscribedOppositions([]);
      setIsLoading(false);
    }
  }, [userId, fetchAndSetActiveOpposition]);

  const handleOppositionChange = useCallback(
    (selectedOppositionId: string) => {
      const selectedOp = userSubscribedOppositions.find(
        (op) => op.id === selectedOppositionId
      );
      if (selectedOp) {
        setActiveOpposition(selectedOp);
      } else {
        console.warn(
          "Selected opposition ID not found in subscribed list:",
          selectedOppositionId
        );
      }
    },
    [userSubscribedOppositions, setActiveOpposition]
  );

  const activeOppositionId = useMemo(
    () => activeOpposition?.id,
    [activeOpposition]
  );

  if (isLoading) {
    return (
      <div className="mt-4 mb-2 px-2 text-sm text-muted-foreground flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Cargando oposiciones...
      </div>
    );
  }

  if (userId && userSubscribedOppositions.length === 0) {
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

  if (!userId) {
    return null;
  }

  if (userSubscribedOppositions.length > 0) {
    return (
      <div className="mt-4 mb-2 px-2">
        <div className="flex flex-col gap-2">
          <Select
            onValueChange={handleOppositionChange}
            value={activeOppositionId || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una oposición">
                {activeOpposition?.name}
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
          {activeOppositionId && (
            <div>
              <StudyCycleSelector oppositionId={activeOppositionId} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="mt-4 mb-2 px-2 text-sm text-muted-foreground">
      Selecciona tu oposición.
    </p>
  );
};

export default OpositionSelector;
