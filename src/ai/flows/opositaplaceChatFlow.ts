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

export const ChatMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const OpositaPlaceChatInputSchema = z.object({
    query: z.string(),
    sessionPath: z.string().optional(),
    chatHistory: z.array(ChatMessageSchema).optional(),
    currentOppositionName: z.string().optional(),
});

export const OpositaPlaceChatStreamChunkSchema = z.object({
    replyChunk: z.string(),
});

export const opositaplaceChatFlow = ai.defineFlow(
    {
        name: 'opositaplaceChatFlow',
        inputSchema: OpositaPlaceChatInputSchema,
        outputSchema: OpositaPlaceChatFinalOutputSchema,
        streamSchema: OpositaPlaceChatStreamChunkSchema,
    },
    async (input, { sendChunk }) => {
        const { query, sessionPath, chatHistory } = input;

        const intentPrompt = `
      Clasifica la intención de la siguiente "Consulta del Usuario" en una de estas categorías:

     - KNOWLEDGE_QUERY: El usuario hace una pregunta específica sobre el temario de oposiciones.
      - CLARIFICATION_REQUEST: El usuario pide una aclaración, un ejemplo, o dice que no entiende la respuesta anterior.
      - CAPABILITIES_INQUIRY: El usuario pregunta sobre las capacidades del bot.
      - CONVERSATIONAL_RESPONSE: El usuario da una respuesta corta y conversacional (gracias, hola, ok).
      - UNRELATED_QUERY: El usuario pregunta sobre temas no relacionados.

      Responde únicamente con el nombre de la categoría (ej: KNOWLEDGE_QUERY).

      Consulta del Usuario: "${query}"
    `;

        const intentClassification = await ai.generate({
            prompt: intentPrompt,
            output: { format: 'text' },
            config: { temperature: 0.0 },
        });
        const intent = intentClassification.text.trim();

        // --- PASO 2: Actuar según la Intención (usando un switch) ---

        let result;
        let finalAnswerText: string | null = null;
        let answerText: string | null = null;
        let references: Reference[] = [];
        let finalSessionPath: string | null = sessionPath || null;

        switch (intent) {
            case 'KNOWLEDGE_QUERY':
                result = await getConversationalAnswer(query, sessionPath);
                answerText = result.answer;
                references = result.references;
                finalSessionPath = result.sessionPath;
                break;

            case 'CLARIFICATION_REQUEST':
                if (chatHistory && chatHistory.length > 0) {
                    const lastBotResponse = chatHistory.filter((msg) => msg.role === 'model').pop();
                    if (lastBotResponse) {
                        const enrichedQuery = `El usuario no ha entendido o pide una aclaración sobre esta respuesta anterior: "${lastBotResponse.content}". Por favor, explica el concepto principal de esa respuesta con otras palabras o de forma más sencilla.`;
                        result = await getConversationalAnswer(enrichedQuery, sessionPath);
                        answerText = result.answer;
                        finalSessionPath = result.sessionPath;
                    } else {
                        answerText = 'Por favor, ¿puedes recordarme sobre qué tenías la duda?';
                    }
                } else {
                    answerText =
                        '¿Podrías darme un poco más de contexto sobre lo que no entiendes?';
                }
                break;

            case 'CAPABILITIES_INQUIRY':
                answerText = `Mi principal función es ayudarte a entender el temario que has cargado. Puedes pedirme que haga cosas como:

                - **Explicar conceptos:** "Explícame el recurso de alzada".
                - **Resumir artículos o capítulos:** "¿Qué dice el Título Preliminar de la Constitución?".
                - **Definir términos:** "¿Qué es un acto administrativo?".

                Mi conocimiento se basa únicamente en los documentos proporcionados, y siempre que sea posible, citaré mis fuentes. Si no entiendo algo, ¡puedes pedirme que te lo explique de otra manera!`;
                result = { references: [] };
                break;

            case 'CONVERSATIONAL_RESPONSE':
                // Respondemos directamente sin llamar a la API de búsqueda
                const conversationalPrompt = `

                    El usuario ha dicho algo conversacional que no requiere una búsqueda en el temario.
                    Su mensaje fue: "${query}"

                    Genera una respuesta corta, amable y adecuada. Si te dan las gracias, responde de nada. Si saludan, devuelve el saludo y ofrece ayuda.
                    `;

                try {
                    const data = await ai.generate({
                        prompt: conversationalPrompt,
                        output: { format: 'text' },
                        config: { temperature: 0.7 },
                    });
                    answerText = data?.text.trim();
                } catch (error) {
                    console.error('Error generating conversational response:', error);
                    answerText = 'Lo siento, no pude generar una respuesta en este momento.';
                }

                result = { references: [] }; // No hay referencias para este tipo de respuesta.
                break;

            case 'UNRELATED_QUERY':
            default:
                answerText =
                    'Lo siento, como OpositaBot, mi especialidad es ayudarte con el temario de tus oposiciones. No puedo responder a preguntas sobre otros temas.';
                result = { references: [] };
                break;
        }

        const uniqueSources = new Map<string, Reference>();
        if (references && references.length > 0) {
            references.forEach((ref) => {
                const key = `${ref.id}-${ref.pageIdentifier}`;
                if (!uniqueSources.has(key)) {
                    uniqueSources.set(key, ref);
                }
            });
        }
        const deDuplicatedReferences = Array.from(uniqueSources.values());

        // Enviamos el chunk con la respuesta principal de texto
        if (finalAnswerText) {
            sendChunk({ replyChunk: finalAnswerText });
        }
        // Si no hay referencias (respuesta conversacional)
        sendChunk({ replyChunk: answerText || '' });
        return {
            fullReply: answerText || 'No se pudo generar una respuesta.',
            references: deDuplicatedReferences,
            sessionPath: finalSessionPath || '',
        };
    }
);
