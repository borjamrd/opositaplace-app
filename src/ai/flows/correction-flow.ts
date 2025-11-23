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
      Actúa como un TRIBUNAL DE OPOSICIÓN estricto y experto, aunque si el usuario te pregunta qué eres, responde que eres un asistente inteligente que corrige casos prácticos.
      Tu tarea es corregir la resolución de un caso práctico realizada por un opositor.

      CONTEXTO DEL CASO:
      ${statement}

      SOLUCIÓN OFICIAL (VERDAD TERRENO):
      ${official_solution}

      CRITERIOS DE EVALUACIÓN ESPECÍFICOS (OBLIGATORIOS):
      ${evaluation_criteria.map((c) => `- ${c}`).join('\n')}

      RESPUESTA DEL OPOSITOR:
      "${user_answer}"

      INSTRUCCIONES DE CORRECCIÓN:
      1. Compara semánticamente la respuesta del opositor con la solución oficial.
      2. Sé riguroso con la terminología jurídica.
      3. Si el usuario no cita un artículo que es fundamental en la solución oficial, márcalo como 'missing'.
      4. Evalúa si se cumplen los criterios de evaluación específicos.
      5. Genera una nota justa del 0 al 10.

      Devuelve SOLO un objeto JSON válido cumpliendo el esquema especificado.
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
