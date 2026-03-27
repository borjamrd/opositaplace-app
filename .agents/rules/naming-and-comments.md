---
trigger: always_on
---

# Rule: Naming & Self-Documenting Code

- **No Comments Policy**: Avoid using comments to explain _what_ the code is doing. If code requires a comment to be understood, it should be refactored into smaller, better-named functions or variables.
- **Exceptions**: Use comments ONLY for:
  - Explaining the "Why" (complex business logic or non-obvious legal requirements from the LCSP).
  - Temporary TODOs or critical bug warnings.
  - JSDoc for complex public-facing AI tools/flows.
- **Naming Conventions**:
  - **Variables/Functions**: Use descriptive, intention-revealing names (e.g., `calculateRemainingStudyDays` instead of `getDays`).
  - **Booleans**: Prefix with `is`, `has`, or `should` (e.g., `isSubscriptionActive`).
  - **Tailwind v4 Variables**: Use semantic names in CSS theme blocks (e.g., `--color-brand-primary` instead of `--color-blue-500`).
- **Standard**: Code must read like prose. If a function is longer than 20 lines, break it down into smaller named utilities.
