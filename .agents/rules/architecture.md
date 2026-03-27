---
trigger: always_on
---

# OpositaPlace Architecture Standards

- **Server Actions**: All mutations must be placed in `src/actions/` and include the `"use server"` directive.
- **Data Access Layer**: Database logic must reside in `src/lib/supabase/queries/`. Do not call Supabase directly from UI components.
- **Validation**: Every Server Action must validate its input using **Zod** schemas.
- **Component Hierarchy**:
  - `src/components/ui`: Reserved for base components (Shadcn/Magic UI). Avoid manual logic here.
  - `src/components/[feature]`: Domain-specific components with business logic.
- **Naming Convention**: Use kebab-case for filenames and PascalCase for React components.
