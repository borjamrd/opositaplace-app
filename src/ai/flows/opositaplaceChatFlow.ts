// ai/flows/opositaplaceChatFlow.ts
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getConversationalAnswer, Reference } from '@/ai/tools/knowledgeSearchTool';

const ReferenceSchema = z.object({
    id: z.string(),
    text: z.string(),
    link: z.string(),
    pageIdentifier: z.string(),
    title: z.string(),
});

export const OpositaPlaceChatFinalOutputSchema = z.object({
    fullReply: z.string(),
    references: z.array(ReferenceSchema),
    sessionPath: z.string(),
});

interface Source {
    id: string;
    text: string;
    link: string;
    pageIdentifier: string;
    title: string;
}
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    sources?: Source[];
}
export const OpositaPlaceChatInputSchema = z.object({
    query: z.string(),
    sessionPath: z.string().optional(),
    currentOppositionName: z.string().optional(),
});

export const OpositaPlaceChatStreamChunkSchema = z.object({
    replyChunk: z.string(),
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
        const result = await getConversationalAnswer(query, sessionPath);

        const finalAnswerText = result.answer || 'No se pudo generar una respuesta.';

        if (finalAnswerText) {
            sendChunk({ replyChunk: finalAnswerText });
        }

        const uniqueReferences = new Map<string, Reference>();
        (result.references || []).forEach((ref) => {
            const key = `${ref.id}-${ref.pageIdentifier}`;
            if (!uniqueReferences.has(key)) {
                uniqueReferences.set(key, ref);
            }
        });

        const deDuplicatedReferences = Array.from(uniqueReferences.values());

        return {
            fullReply: finalAnswerText,
            references: deDuplicatedReferences,
            sessionPath: result.sessionPath || '',
        };
    }
);
