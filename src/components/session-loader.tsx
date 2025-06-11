
'use client';

import { useStudySessionStore } from "@/store/study-session-store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SessionLoader() {
    const fetchInitialSession = useStudySessionStore(state => state.fetchInitialSession);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
        };
        getUser();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchInitialSession(userId);
        }
    }, [userId, fetchInitialSession]);

    // Este componente no renderiza nada, solo ejecuta la lógica de carga.
    return null;
}