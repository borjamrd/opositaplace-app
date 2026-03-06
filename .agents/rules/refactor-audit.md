---
trigger: always_on
---

# Rule: Refactoring & Architecture Audit

You must audit every file you touch for the following "code smells":

- **Design Debt**: Identify any hardcoded colors (hex, rgb, hsl) or spacing values. Everything must use the semantic CSS variables defined in `@src/app/globals.css` (e.g., `bg-primary`, `text-foreground`). Avoid utility classes that use specific colors (e.g., `bg-blue-500`) in favor of their semantic equivalents.
- **Type Integrity**: Verify that all database interactions are strictly typed using `database.types.ts`. Ensure Server Actions validate inputs with Zod schemas and maintain proper TypeScript interfaces (avoid `any`).
- **Misplaced UI**: If a component is a generic primitive (Button, Input, etc.) but is not in `src/components/ui/`, flag it for migration.
- **Leaked Logic**: Identify any direct Supabase calls (`supabase.from(...)`) or complex business logic inside `.tsx` files. This logic must be moved to `src/actions/` (for mutations) or `src/lib/supabase/queries/` (for data fetching).
- **Naming & Comments**: Ensure variables are intention-revealing. Remove comments that explain "what" the code does; keep only those explaining "why" (legal or complex AI logic).
- **Test Debt**: Check for a corresponding .test.tsx or .test.ts file in the same directory. If missing, flag it. Ensure tests use vitest and @testing-library/react, and that external dependencies (like Supabase or Server Actions) are properly mocked.
  **Action**: Before modifying a file, provide a "Refactor Report" listing which of these points are being violated.
