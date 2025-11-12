import { createClient } from '@/lib/supabase/client';
import { Opposition } from '../types';



export async function getActiveOppositions(): Promise<Opposition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('oppositions')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching oppositions:', error);
    return [];
  }
  return data || [];
}
