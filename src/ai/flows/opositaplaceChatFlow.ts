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
        let finalAnswerText: string | null = null;
        let references: Reference[] = [];
        let finalSessionPath: string | null = sessionPath || null;

        const streamResponse = async (prompt: string): Promise<string> => {
            const { stream } = await ai.generateStream({ prompt });
            let accumulatedReply = '';
            for await (const chunk of stream) {
                const textChunk = chunk.content[0]?.text;
                if (textChunk) {
                    sendChunk({ replyChunk: textChunk });
                    accumulatedReply += textChunk;
                }
            }
            return accumulatedReply;
        };

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
        console.log(`Intent classified as: ${intent}`);

        switch (intent) {
            case 'KNOWLEDGE_QUERY':
                try {
                    const ragResult = await getConversationalAnswer(query, sessionPath);
                    references = ragResult.references;
                    finalSessionPath = ragResult.sessionPath;
                    const context = ragResult.answer;
                    const prompt = `
                        Basándote ESTRICTAMENTE en el siguiente contexto, responde a la pregunta del usuario...
                        CONTEXTO: ${context}
                        PREGUNTA DEL USUARIO: ${query}
                    `;
                    finalAnswerText = await streamResponse(prompt);
                } catch (e) {
                    finalAnswerText = 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
                    sendChunk({ replyChunk: finalAnswerText });
                }
                break;

            case 'CLARIFICATION_REQUEST':
                try {
                    if (chatHistory && chatHistory.length > 0) {
                        const lastBotResponse = chatHistory
                            .filter((msg) => msg.role === 'model')
                            .pop();
                        if (lastBotResponse) {
                            const enrichedQuery = `El usuario tiene una duda sobre la siguiente respuesta: "${lastBotResponse.content}". La duda específica es: "${query}".`;

                            // ✅ PASO 2: Volver a buscar en la base de conocimiento con la duda.
                            // Esto nos dará un nuevo contexto y, crucialmente, las referencias.
                            const ragResult = await getConversationalAnswer(
                                enrichedQuery,
                                sessionPath
                            );

                            // Guardamos las nuevas referencias y el sessionPath.
                            references = ragResult.references;
                            finalSessionPath = ragResult.sessionPath;
                            const newContext = ragResult.answer;
                            const finalPrompt = `
                                    Eres un asistente experto en oposiciones. Tu objetivo es aclarar una duda del usuario sobre tu respuesta anterior.

                                    **Tu respuesta anterior fue:**
                                    ---
                                    ${lastBotResponse.content}
                                    ---

                                    **La nueva pregunta o duda del usuario es:**
                                    ---
                                    ${query}
                                    ---

                                    **Instrucciones:**
                                    1.  **Analiza la duda:** Si la duda del usuario es vaga (como "no entiendo" o "tengo dudas"), no simplifiques en exceso. En su lugar, intenta abordar el concepto central de tu respuesta anterior desde un ángulo diferente. Puedes usar una analogía o dividirlo en partes más pequeñas.
                                    2.  **Usa ejemplos concretos:** Si es apropiado, utiliza ejemplos prácticos para ilustrar los puntos clave.
                                    3.  **Mantén un tono profesional:** Evita un lenguaje demasiado coloquial o infantil (como llamar al Defensor del Pueblo un "superhéroe"). El tono debe ser el de un tutor experto.
                                    4.  **No repitas, reelabora:** No te limites a repetir la información anterior. Reorganiza, reformula y añade valor para facilitar la comprensión.
                                    5.  **Si la duda es específica**, céntrate en responder a esa duda concreta.

                                    Basándote en estas instrucciones, proporciona una aclaración útil y detallada.
                                `;
                            finalAnswerText = await streamResponse(finalPrompt);
                        } else {
                            finalAnswerText =
                                'Por favor, ¿puedes recordarme sobre qué tenías la duda?';
                            sendChunk({ replyChunk: finalAnswerText });
                        }
                    } else {
                        finalAnswerText =
                            '¿Podrías darme un poco más de contexto sobre lo que no entiendes?';
                        sendChunk({ replyChunk: finalAnswerText });
                    }
                } catch (e) {
                    finalAnswerText =
                        'Lo siento, ha ocurrido un error al intentar aclarar la respuesta.';
                    sendChunk({ replyChunk: finalAnswerText });
                }
                break;

            case 'CAPABILITIES_INQUIRY':
                try {
                    finalAnswerText = `Mi principal función es ayudarte a entender el temario que has cargado. Puedes pedirme que haga cosas como:

                                    - Explicar conceptos: "Explícame el recurso de alzada".
                                    - Resumir artículos o capítulos: "¿Qué dice el Título Preliminar de la Constitución?".
                                    - Definir términos: "¿Qué es un acto administrativo?".

                                    Mi conocimiento se basa únicamente en la documentación oficial del BOE, y siempre que sea posible, citaré mis fuentes. Si no entiendo algo, ¡puedes pedirme que te lo explique de otra manera!`;
                    sendChunk({ replyChunk: finalAnswerText });
                } catch (e) {
                    finalAnswerText = 'Lo siento, ha ocurrido un error al mostrar mis capacidades.';
                    sendChunk({ replyChunk: finalAnswerText });
                }
                references = [];
                break;

            case 'CONVERSATIONAL_RESPONSE':
                try {
                    const conversationalPrompt = `
                        El usuario ha dicho algo conversacional que no requiere una búsqueda en el temario.
                        Su mensaje fue: "${query}"
                        Genera una respuesta corta, amable y adecuada. Si te dan las gracias, responde de nada. Si saludan, devuelve el saludo y ofrece ayuda.
                    `;
                    const data = await ai.generate({
                        prompt: conversationalPrompt,
                        output: { format: 'text' },
                        config: { temperature: 0.7 },
                    });
                    finalAnswerText = data?.text.trim() || '¡Claro que sí!';
                    sendChunk({ replyChunk: finalAnswerText });
                } catch (error) {
                    finalAnswerText = 'Lo siento, no pude generar una respuesta en este momento.';
                    sendChunk({ replyChunk: finalAnswerText });
                }
                references = [];
                break;

            case 'UNRELATED_QUERY':
            default:
                try {
                    finalAnswerText =
                        'Lo siento, como OpositaBot, mi especialidad es ayudarte con el temario de tus oposiciones. No puedo responder a preguntas sobre otros temas.';
                    sendChunk({ replyChunk: finalAnswerText });
                } catch (e) {
                    finalAnswerText = 'Lo siento, ha ocurrido un error.';
                    sendChunk({ replyChunk: finalAnswerText });
                }
                references = [];
                break;
        }

        const uniqueSources = new Map<string, Reference>();
        references.forEach((ref) => {
            const key = `${ref.id}-${ref.pageIdentifier}`;
            if (!uniqueSources.has(key)) uniqueSources.set(key, ref);
        });
        const deDuplicatedReferences = Array.from(uniqueSources.values());

        return {
            fullReply: finalAnswerText || 'No se pudo generar una respuesta.',
            references: deDuplicatedReferences,
            sessionPath: finalSessionPath || '',
        };
    }
);
