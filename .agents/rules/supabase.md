---
trigger: glob
globs: src/lib/supabase/**, src/actions/**
---

# Supabase & TypeScript Rules

- **Client Usage**: Use the server client from `src/lib/supabase/server.ts` for Actions and Route Handlers.
- **Type Safety**: Always reference `@src/lib/supabase/database.types.ts`. Avoid using `any` for database records.
- **Data Operations**: Use `TablesInsert<'table_name'>` or `TablesUpdate<'table_name'>` helpers for write operations to ensure schema compliance.
