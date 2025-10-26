import { createClient } from '@/lib/supabase/client'; // Usamos el cliente del lado del cliente para esto
import { Opposition } from '../types';



export async function getActiveOppositions(): Promise<Opposition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('oppositions')
    .select('id, name, description, created_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching oppositions:', error);
    return [];
  }
  return data || [];
}
