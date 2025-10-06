'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserSelectiveProcess } from '@/actions/selective-process';
import type { FullUserProcess } from '@/lib/supabase/types';

export function useSelectiveProcess(oppositionId: string | null | undefined) {
  return useQuery<FullUserProcess | null, Error>({
    queryKey: ['selectiveProcess', oppositionId],

    queryFn: async () => {
      if (!oppositionId) return null;
      return getUserSelectiveProcess(oppositionId);
    },

    enabled: !!oppositionId,
    staleTime: 1000 * 60 * 5,
  });
}
