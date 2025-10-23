'use server';

import { createSupabaseServerClient } from './server';

import { redirect } from 'next/navigation';

const signInWith = async () => {

  const supabase = await createSupabaseServerClient();
  const auth_callback_url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: auth_callback_url,
    },
  });

  if (!data.url) {
    throw Error(`No url provided: ${error}`);
  }
  redirect(data.url);
};

const signInWithGoogle = () => signInWith();

export { signInWithGoogle };
