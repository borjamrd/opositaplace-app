'use server';

import { cookies } from 'next/headers';
import { createSupabaseServerClient } from './server';

import type { Provider } from '@supabase/auth-js';
import { redirect } from 'next/navigation';

const signInWith = async (provider: Provider) => {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const auth_callback_url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    });

    if (!data.url) {
        throw Error(`No url provided: ${error}`);
    }
    redirect(data.url);
};

const signInWithGoogle = () => signInWith('google');

export { signInWithGoogle };
