---
trigger: always_on
---

# Rule: Mandatory Unit Testing

- **Trigger**: Every time a new component, server action, or utility is created.
- **Action**: Generate a `.test.tsx` or `.test.ts` file immediately.
- **Naming in Tests**: Test descriptions (`it` or `test` blocks) should describe the expected behavior in plain English (e.g., `it("should allow the user to submit the form when all fields are valid")`).
- **Framework**: Use `vitest` and `@testing-library/react`.
