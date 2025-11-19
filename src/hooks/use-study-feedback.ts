import { useQuery } from '@tanstack/react-query';
import { getFeedbackContext } from '@/actions/study-feedback';

export function useStudyFeedbackData() {
  return useQuery({
    queryKey: ['study-feedback-context'], 
    queryFn: async () => {
      const data = await getFeedbackContext();
      if (!data) throw new Error('No se pudieron cargar los datos de feedback');
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
