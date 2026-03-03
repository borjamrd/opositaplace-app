---
trigger: always_on
---

# Rule: Content Scoring System (0-100)

## Context

This rule is triggered after a response is generated. Its purpose is to evaluate the quality, accuracy, and relevance of the output against the user's original request.

## Evaluation Criteria

The final score is calculated out of **100 points**, distributed as follows:

1. **Relevance & Alignment (40 pts):**
   - Does it directly address the user's prompt?
   - Did it follow all specific instructions and constraints?
2. **Accuracy & Factuality (30 pts):**
   - Is the information correct and free of hallucinations?
   - Is the internal logic consistent and sound?
3. **Structure & Formatting (20 pts):**
   - Is the content easy to scan and well-organized?
   - Does it correctly use Markdown, tables, or LaTeX as requested?
4. **Tone & Added Value (10 pts):**
   - Is the persona/tone appropriate for the context?
   - Does it provide helpful insights beyond a generic response?

## Scoring Scale

- **90-100 (Excellent):** Flawless response; meets all criteria and exceeds expectations.
- **70-89 (Good):** Task completed well, but minor improvements in formatting or depth are possible.
- **50-69 (Sufficient):** Contains minor errors or lacks detail, but remains functional.
- **0-49 (Deficient):** Fails to meet the request, contains hallucinations, or ignores constraints.

## Mandatory Output Format

At the end of every evaluation, include the following block:

---

> **SCORE_REVIEW**
>
> - **Score:** [0-100]/100
> - **Reasoning:** [Brief explanation of the assigned score]
> - **Suggested Improvement:** [Specific action to reach a 100 score]

---
