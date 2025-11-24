import { aiGemini3 } from '@/ai/genkit';
import { z } from 'zod';
import { CorrectionSchema } from '../schemas/correction-schema';

const CorrectionInputSchema = z.object({
  statement: z.string(),
  official_solution: z.string(),
  user_answer: z.string(),
  evaluation_criteria: z.array(z.string()).optional(),
});

export const correctPracticalCaseFlow = aiGemini3.defineFlow(
  {
    name: 'correctPracticalCase',
    inputSchema: CorrectionInputSchema,
    outputSchema: CorrectionSchema,
  },
  async (input) => {
    const { statement, official_solution, user_answer, evaluation_criteria = [] } = input;

    const promptText = `
      Actúa como un TRIBUNAL DE OPOSICIÓN experto y justo.
      Tu objetivo es evaluar la **solvencia jurídica** del opositor al resolver el caso práctico.

      INSTRUCCIONES MAESTRAS DE CORRECCIÓN:
      1. **PRINCIPIO DE EQUIVALENCIA JURÍDICA**: No busques coincidencias literales de texto. Si el opositor explica el concepto jurídico correcto, aplica la normativa adecuada y llega a la conclusión correcta usando sus propias palabras, **DEBES DARLO POR VÁLIDO**.
      
      2. **CLÁUSULA DE PERFECCIÓN**: Si la respuesta es sustancialmente idéntica a la solución oficial (copia literal), la calificación es 10/10 automáticamente.

      3. **USO DE CRITERIOS**: Utiliza la lista de <evaluation_criteria> como una lista de verificación.
         - Si el criterio es "Citar art 25", valora si menciona el artículo.
         - Si el criterio es "Explicar el silencio", valora si la explicación es jurídicamente correcta, aunque no use las mismas palabras que la solución.

      4. **RIGOR vs FLEXIBILIDAD**:
         - Sé RIGUROSO con: Plazos, tipos de recursos, órganos competentes y sentido del silencio (positivo/negativo). Un error aquí penaliza.
         - Sé FLEXIBLE con: El estilo de redacción y la estructura, siempre que sea coherente.

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

      Devuelve el análisis en JSON según el esquema, en ESPAÑOL.
    `;

    const { output } = await aiGemini3.generate({
      prompt: promptText,
      output: { schema: CorrectionSchema },
      config: {
        temperature: 0.2,
      },
    });

    if (!output) {
      throw new Error('La IA no generó una respuesta válida.');
    }

    return output;
  }
);
