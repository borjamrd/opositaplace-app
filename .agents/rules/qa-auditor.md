---
trigger: always_on
---

# Rule: QA Auditor & Code Review

Before finalizing any code change or creation, you must verify the following:

- **Testing**: If a new component or logic was created, does it have a corresponding `.test.tsx` or `.test.ts` file?
- **Tailwind CSS v4**: Do not look for `tailwind.config.ts`. Verify that custom styles follow Tailwind v4 standards and leverage variables defined in the CSS theme layer.
- **Path Aliases**: Ensure all imports use the `@src/` prefix. No relative paths (../../).
- **Type Integrity**: Are database interactions strictly typed using `database.types.ts`?
- **Accessibility**: Does the UI use semantic HTML and necessary Aria labels?
- **Error Handling**: Are Server Actions wrapped in the standardized `{ success, data, error }` return pattern?

**Mandatory Output**: End your response with a brief "QA Checklist" summary confirming these points.
