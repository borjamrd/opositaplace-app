// src/lib/supabase/queries/useStudyCycles.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { StudyCycle } from '@/store/study-session-store';

const fetchStudyCycles = async (oppositionId: string, userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_study_cycles')
    .select('*')
    .eq('opposition_id', oppositionId)
    .eq('user_id', userId)
    .order('cycle_number', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

export function useStudyCycles(
  oppositionId: string | null | undefined,
  userId: string | null | undefined
) {
  return useQuery<StudyCycle[], Error>({
    queryKey: ['studyCycles', oppositionId, userId],
    queryFn: () => {
      if (!oppositionId || !userId) {
        return Promise.resolve([]);
      }
      return fetchStudyCycles(oppositionId, userId);
    },
    enabled: !!oppositionId && !!userId,
  });
}
