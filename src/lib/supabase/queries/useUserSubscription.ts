// src/lib/supabase/queries/useUserSubscription.ts
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/database.types";
import { Subscription } from "@/lib/stripe/actions";

// Esta función podría ser una Server Action o una API route que llame a la
// función getUserSubscription que definimos anteriormente.
// Por simplicidad aquí, simulamos la llamada directa desde el cliente,
// pero en una app real, para obtener datos sensibles o realizar lógica compleja,
// se haría a través de un endpoint o server action.
async function fetchUserSubscription(userId: string | null): Promise<Subscription | null> {
  if (!userId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) {
    console.error('Error fetching user subscription in hook:', error);
    return null;
  }
  return data;
}

export function useUserSubscription() {
  const supabase = createClient();

  return useQuery<Subscription | null, Error>({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null; 
      return fetchUserSubscription(user.id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}