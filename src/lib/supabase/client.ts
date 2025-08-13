import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function invokeCreateConversation() {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke('create-conversation');
    if (error) throw error;
    return data;
}
