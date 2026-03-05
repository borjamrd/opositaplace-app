---
description: # Workflow: Refactor Logic to Server Action
---

# Workflow: Refactor Logic to Server Action

1. Analyze the selected component and identify `useEffect` hooks or event handlers calling Supabase directly.
2. Create a corresponding file in `src/actions/` if it doesn't exist.
3. Move the data logic to the new Action, adding Zod validation and proper Supabase typing.
4. Replace the client-side logic in the component with the Action call, using `useTransition` for loading states.
5. Ensure no sensitive environment variables are exposed to the client-side bundle.
