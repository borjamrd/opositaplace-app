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

        let finalAnswerText = result.answer || 'No se pudo generar una respuesta.';

        // --- LÓGICA DE DE-DUPLICACIÓN DE FUENTES ---
        if (result.references && result.references.length > 0) {
            // Usamos un Map para garantizar que cada combinación de título y página sea única.
            const uniqueSources = new Map<string, { title: string; pageIdentifier: string }>();
            result.references.forEach((ref) => {
                const key = `${ref.title}-${ref.pageIdentifier}`; // Creamos una clave única
                if (!uniqueSources.has(key)) {
                    uniqueSources.set(key, {
                        title: ref.title,
                        pageIdentifier: ref.pageIdentifier,
                    });
                }
            });

            // Ahora, construimos la lista a partir de las fuentes únicas.
            const sourcesHeader = '\n\n---\n**Fuentes:**\n';
            const sourcesList = Array.from(uniqueSources.values())
                .map((source, index) => {
                    const pageInfo =
                        source.pageIdentifier !== 'N/A' ? `(pág. ${source.pageIdentifier})` : '';
                 
                    return `* ${source.title} ${pageInfo}`;
                })
                .join('\n');

            finalAnswerText += sourcesHeader + sourcesList;
        }
        if (finalAnswerText) {
            sendChunk({ replyChunk: finalAnswerText });
        }

        return {
            fullReply: finalAnswerText,
            sessionPath: result.sessionPath || '',
        };
    }
);
