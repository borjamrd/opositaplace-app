// En: src/app/auth/callback/route.ts

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { setupNewUser } from '@/lib/stripe/actions';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      try {
        await setupNewUser(user);
      } catch (setupError: any) {
        console.warn(
          `Error durante el setup (oauth callback) del nuevo usuario ${user.id}:`,
          setupError.message
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
