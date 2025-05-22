import type { Database } from '@/lib/database.types';
import { createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';

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

export function createSupabaseServerActionClient(
  cookieStore: ReturnType<typeof cookies>
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options) {
          try {
            // @ts-ignore
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.warn('Failed to set cookie in Server Action:', error)
          }
        },
        async remove(name: string, options) {
          try {
            // @ts-ignore 
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.warn('Failed to remove cookie in Server Action:', error)
          }
        }
      },
    }
  )
}