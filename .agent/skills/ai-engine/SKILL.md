---
name: ai-engine
description: OpositaPlace AI Engine. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---

# Skill: OpositaPlace AI Engine

This project utilizes **Google Genkit** for LLM orchestration and **Inngest** for background workflows.

## Key Workflows:

1. `opositaplaceChatFlow`: Primary conversational logic for candidates.
2. `correction-flow`: Automated correction of practical cases using Zod schemas found in `src/ai/schemas/`.

## Agent Instructions:

- When modifying a `flow`, always verify the `outputSchema` to maintain frontend compatibility.
- Prompts should be defined within the flow or in dedicated `.prompt` files if they grow in complexity.
- Use the `knowledgeSearchTool` for any queries requiring legal basis (specifically the LCSP - Spanish Public Sector Contracts Law).
