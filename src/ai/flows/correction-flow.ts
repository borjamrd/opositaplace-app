// src/ai/flows/correction-flow.ts
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { CorrectionSchema } from '../schemas/correction-schema';

const CorrectionInputSchema = z.object({
  statement: z.string(),
  official_solution: z.string(),
  user_answer: z.string(),
  evaluation_criteria: z.array(z.string()).optional(),
});

export const correctPracticalCaseFlow = ai.defineFlow(
  {
    name: 'correctPracticalCase',
    inputSchema: CorrectionInputSchema,
    outputSchema: CorrectionSchema,
  },
  async (input) => {
    const { statement, official_solution, user_answer, evaluation_criteria = [] } = input;

    const promptText = `
     Actúa como un TRIBUNAL DE OPOSICIÓN objetivo y experto.
      Tu tarea es corregir la resolución de un caso práctico realizada por un opositor.

      INSTRUCCIONES DE CORRECCIÓN PRIORITARIAS:
      1. SI LA RESPUESTA DEL ALUMNO ES SUSTANCIALMENTE IDÉNTICA O MUY PARECIDA A LA SOLUCIÓN OFICIAL, LA CALIFICACIÓN DEBE SER 10/10 SIN EXCEPCIONES.
      2. Evalúa únicamente basándote en la <official_solution> provista.
      3. Sé riguroso con la terminología jurídica, pero premia la precisión.
      4. Responde SIEMPRE en ESPAÑOL.

      <case_context>
      ${statement}
      </case_context>

      <official_solution>
      ${official_solution}
      </official_solution>

      <evaluation_criteria>
      ${evaluation_criteria.map((c) => `- ${c}`).join('\n')}
      </evaluation_criteria>

      <student_answer>
      ${user_answer}
      </student_answer>

      Genera el informe de corrección en formato JSON estricto.
    `;

    const { output } = await ai.generate({
      prompt: promptText,
      output: { schema: CorrectionSchema },
    });

    if (!output) {
      throw new Error('El agente nogeneró una respuesta válida.');
    }

    return output;
  }
);
