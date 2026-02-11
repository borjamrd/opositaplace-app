import type { Database } from '@/lib/supabase/database.types';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // const { pathname } = request.nextUrl;

  // const protectedPaths = ['/dashboard', '/onboarding'];
  // const publicOnlyPaths = ['/', '/login', '/register', '/reset-password'];

  // const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  // const isPublicOnly = publicOnlyPaths.includes(pathname);

  // if (user) {
  //   const { data: onboardingInfo } = await supabase
  //     .from('onboarding_info')
  //     .select('user_id')
  //     .eq('user_id', user.id)
  //     .maybeSingle();

  //   const onboardingCompleted = !!onboardingInfo;
  //   const onboardingPath = `/onboarding/${user.id}`;

  //   if (!onboardingCompleted) {
  //     if (pathname !== onboardingPath) {
  //       return NextResponse.redirect(new URL(onboardingPath, request.url));
  //     }
  //   } else {
  //     if (isPublicOnly) {
  //       return NextResponse.redirect(new URL('/dashboard', request.url));
  //     }
  //     if (pathname.startsWith('/onboarding')) {
  //       return NextResponse.redirect(new URL('/dashboard', request.url));
  //     }
  //   }
  // } else {
  //   if (isProtected) {
  //     const redirectUrl = new URL('/login', request.url);
  //     redirectUrl.searchParams.set('message', 'Debes iniciar sesión para acceder.');
  //     redirectUrl.searchParams.set('redirect', pathname);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }

  return response;
}
