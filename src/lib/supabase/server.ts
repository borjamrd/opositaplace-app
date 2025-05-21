import { createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export function createSupabaseServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createSupabaseRouteHandlerClient(
  cookieStore: ReturnType<typeof cookies>
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}


// Utility to create Supabase client for server actions
// Note: Cookie handling in Server Actions needs careful consideration
// as they don't have direct access to the same cookie store as middleware or route handlers.
// For many auth operations, it's better to redirect to API routes or use middleware.
// However, Supabase's new server-side auth helpers aim to simplify this.
// This is a basic setup.
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function createSupabaseServerActionClient(
  cookieStore: ReadonlyRequestCookies
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // For server actions, set/remove might be handled by middleware
        // or by returning new headers for the client to handle.
        // Supabase's helpers handle this by interacting with the cookie store
        // passed to them.
        set(name: string, value: string, options) {
          // This will attempt to set the cookie via the cookieStore reference
          // This might not work as expected in all Server Action scenarios without middleware.
          // The recommended pattern is to use middleware to handle cookie updates.
          try {
             // @ts-ignore // cookieStore might be read-only in some contexts.
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn('Failed to set cookie in Server Action:', error);
          }
        },
        remove(name: string, options) {
           try {
            // @ts-ignore
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Failed to remove cookie in Server Action:', error);
          }
        },
      },
    }
  )
}
