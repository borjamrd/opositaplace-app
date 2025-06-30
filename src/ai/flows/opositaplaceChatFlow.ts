// ai/flows/opositaplaceChatFlow.ts
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getConversationalAnswer } from '@/ai/tools/knowledgeSearchTool';


// --- Esquemas (Input y Output como los teníamos) ---
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export const OpositaPlaceChatInputSchema = z.object({
    query: z.string(),
    sessionPath: z.string().optional(),
});

export const OpositaPlaceChatStreamChunkSchema = z.object({
    replyChunk: z.string(),
});

export const OpositaPlaceChatFinalOutputSchema = z.object({
    fullReply: z.string(),
    sessionPath: z.string(),
});

// --- EL FLUJO FINAL Y SIMPLIFICADO ---
export const opositaplaceChatFlow = ai.defineFlow(
    {
        name: 'opositaplaceChatFlow',
        inputSchema: OpositaPlaceChatInputSchema,
        outputSchema: OpositaPlaceChatFinalOutputSchema,
        streamSchema: OpositaPlaceChatStreamChunkSchema,
    },
    async (input, { sendChunk }) => {
        const { query, sessionPath } = input;

        // Llamamos a nuestra única y potente herramienta
        const result = await getConversationalAnswer(query, sessionPath);

        // Enviamos la respuesta de texto (simulando stream)
        if (result.answer) {
            sendChunk({ replyChunk: result.answer });
        }

        return {
            fullReply: result.answer || 'No se pudo generar una respuesta.',
            sessionPath: result.sessionPath || '', // Devolvemos la nueva ruta de la sesión
        };
    }
);
