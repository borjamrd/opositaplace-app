// src/ai/schemas/correction-schema.ts
import { z } from 'zod';

export const CorrectionSchema = z.object({
  score: z.number().min(0).max(10).describe('Nota numérica del 0 al 10'),
  summary: z.string().describe('Un resumen breve y general de la corrección (máx 2 frases)'),

  key_points: z
    .array(
      z.object({
        concept: z.string().describe('El concepto clave que se evaluaba'),
        present: z.boolean().describe('Si el alumno mencionó este concepto correctamente'),
        explanation: z.string().optional().describe('Breve explicación de por qué está mal o bien'),
      })
    )
    .describe('Lista de cotejo de los puntos clave definidos en la solución oficial'),

  legal_check: z
    .array(
      z.object({
        article: z.string().describe("Referencia al artículo o ley (ej: 'Art 14 CE')"),
        status: z.enum(['correct', 'missing', 'wrong']).describe('Estado de la cita legal'),
        comment: z.string().optional().describe('Corrección si la cita es errónea'),
      })
    )
    .optional()
    .describe('Análisis de las citas legales mencionadas o requeridas'),

  suggestions: z.array(z.string()).describe('3 consejos accionables para mejorar en el futuro'),
});

export type CorrectionOutput = z.infer<typeof CorrectionSchema>;
