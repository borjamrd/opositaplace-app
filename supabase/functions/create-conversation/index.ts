// supabase/functions/create-conversation/index.ts
//@ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const MAX_CONVERSATIONS = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    const { count, error: countError } = await supabaseClient
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    if (count >= MAX_CONVERSATIONS) {
      const { data: oldestConversation, error: oldestError } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (oldestError) throw oldestError;

      if (oldestConversation) {
        await supabaseClient.from('conversations').delete().eq('id', oldestConversation.id);
      }
    }

    const { data: newConversation, error: createError } = await supabaseClient
      .from('conversations')
      .insert({ user_id: user.id, title: 'Nuevo Chat' })
      .select()
      .single();

    if (createError) throw createError;

    return new Response(JSON.stringify({ conversation: newConversation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
