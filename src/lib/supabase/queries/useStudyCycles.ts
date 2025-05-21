"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client"; //
import type { StudyCycle } from "@/store/study-cycle-store";

export function useStudyCycles(oppositionId: string | null | undefined) {
  const [cycles, setCycles] = useState<StudyCycle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Obtener el ID del usuario actual
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, [supabase]);

  const fetchCycles = useCallback(async () => {
    if (!oppositionId || !currentUserId) {
      setCycles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("user_study_cycles")
        .select("*") // Selecciona todas las columnas para tener cycle_number, completed_at, etc.
        .eq("opposition_id", oppositionId)
        .eq("user_id", currentUserId) // Muy importante: filtrar por el usuario actual
        .order("cycle_number", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      setCycles(data || []);
    } catch (e) {
      console.error("Error fetching study cycles in hook:", e);
      setError(e);
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  }, [oppositionId, currentUserId, supabase]);

  // Efecto para llamar a fetchCycles cuando oppositionId o currentUserId cambien
  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  return { data: cycles, isLoading, error, refetch: fetchCycles };
}
