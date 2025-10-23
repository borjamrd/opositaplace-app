import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
