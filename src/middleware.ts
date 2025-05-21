import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            // Re-assign response when cookies are set
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            // Re-assign response when cookies are set
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const userId = session?.user?.id;

  // Define la ruta de onboarding. Si no hay userId, redirige a login como fallback.
  const onboardingPath = userId ? `/onboarding/${userId}` : "/login";
  const loginPath = "/login";
  const dashboardPath = "/dashboard";

  if (session && userId) {
    // Usuario autenticado
    // Realizar la consulta de onboarding_info directamente aquí
    const { data: onboardingInfo, error: onboardingError } = await supabase
      .from("onboarding_info")
      .select("user_id") // Solo necesitamos saber si existe
      .eq("user_id", userId)
      .maybeSingle();

    if (onboardingError) {
      console.error(
        "Middleware: Error fetching onboarding info:",
        onboardingError.message
      );
      // Podrías decidir cómo manejar este error, quizás permitir el acceso
      // o redirigir a una página de error. Por ahora, dejamos que continúe.
    }

    if (pathname.startsWith(dashboardPath)) {
      if (!onboardingInfo) {
        // Si no ha completado onboarding y trata de acceder a dashboard, redirigir a onboarding
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      }
      // Si tiene onboarding, permitir acceso a dashboard (NextResponse.next() al final)
    } else if (pathname.startsWith("/onboarding")) {
      // Verifica si está en la ruta específica de SU onboarding
      if (pathname === `/onboarding/${userId}`) {
        if (onboardingInfo) {
          // Si ya completó onboarding e intenta acceder a SU página de onboarding, redirigir a dashboard
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
        // Si no tiene onboarding y está en SU página de onboarding, permitir acceso
      } else {
        // Si está en una ruta /onboarding/otroUserId, pero tiene sesión,
        // y ya completó su onboarding, redirigir a su dashboard.
        // Si no completó su onboarding, redirigirlo a SU path de onboarding.
        if (onboardingInfo) {
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        } else {
          return NextResponse.redirect(new URL(onboardingPath, request.url));
        }
      }
    } else if (pathname === loginPath || pathname === "/register") {
      // Si tiene sesión y trata de acceder a login/register, redirigir a dashboard
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  } else {
    // Usuario no autenticado
    const protectedPaths = [dashboardPath, "/onboarding"];
    if (protectedPaths.some((p) => pathname.startsWith(p))) {
      // Si no hay sesión y trata de acceder a rutas protegidas (dashboard o cualquier /onboarding), redirigir a login
      return NextResponse.redirect(
        new URL(
          `${loginPath}?message=Debes iniciar sesión para acceder.`,
          request.url
        )
      );
    }
  }

  // La llamada a supabase.auth.getSession() al principio ya maneja la actualización de la sesión
  // y las cookies se actualizan a través de los handlers `set` y `remove` si es necesario.
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
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|public/).*)", // Excluye rutas comunes y específicas
    "/dashboard/:path*",
    "/onboarding/:path*", // Asegúrate de que esta ruta esté cubierta
    "/login",
    "/register",
  ],
};
