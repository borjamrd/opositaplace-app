import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

export async function middleware(request: NextRequest) {
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
        async get(name: string) {
          return request.cookies.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (user) {
    // Check onboarding status for authenticated users
    const { data: onboardingInfo, error: onboardingError } = await supabase
      .from('onboarding_info')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const onboardingPath = `/onboarding/${user.id}`;

    // Handle dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!onboardingInfo) {
        // Redirect to onboarding if not completed
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      }
    }

    // Handle onboarding routes
    if (pathname.startsWith('/onboarding')) {
      if (pathname === onboardingPath) {
        if (onboardingInfo) {
          // If onboarding is complete, redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Allow access to their own onboarding page if not completed
      } else {
        // Redirect to appropriate path if trying to access another user's onboarding
        return NextResponse.redirect(
          new URL(onboardingInfo ? '/dashboard' : onboardingPath, request.url)
        );
      }
    }

    // Redirect logged in users away from auth pages
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // Handle non-authenticated users
    const protectedPaths = ['/dashboard', '/onboarding'];
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('message', 'Debes iniciar sesión para acceder.');
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Y también excluimos rutas API y otras que no necesiten esta lógica,
     * excepto las que explícitamente queremos proteger o gestionar.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|public/).*)',
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
};
