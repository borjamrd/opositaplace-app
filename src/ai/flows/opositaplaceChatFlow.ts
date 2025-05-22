import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Esquemas (sin cambios)
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const OpositaPlaceChatInputSchema = z.object({
  query: z.string().describe("La consulta actual del usuario."),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe("El historial reciente de la conversación."),
  currentOppositionName: z
    .string()
    .optional()
    .describe("El nombre de la oposición activa del usuario."),
});
export type OpositaPlaceChatInput = z.infer<typeof OpositaPlaceChatInputSchema>;

// El outputSchema ahora representa el objeto final que se devuelve DESPUÉS de que el stream ha terminado.
// El streamSchema definirá el tipo de cada chunk.
export const OpositaPlaceChatStreamChunkSchema = z.object({
  replyChunk: z.string(), // Cada trozo de la respuesta
});
export type OpositaPlaceChatStreamChunk = z.infer<
  typeof OpositaPlaceChatStreamChunkSchema
>;

export const OpositaPlaceChatFinalOutputSchema = z.object({
  fullReply: z
    .string()
    .describe(
      "La respuesta completa del chatbot después de que el stream ha terminado."
    ),
});
export type OpositaPlaceChatFinalOutput = z.infer<
  typeof OpositaPlaceChatFinalOutputSchema
>;

export const opositaplaceChatFlow = ai.defineFlow(
  {
    name: "opositaplaceChatFlow",
    inputSchema: OpositaPlaceChatInputSchema,
    outputSchema: OpositaPlaceChatFinalOutputSchema, 
    streamSchema: OpositaPlaceChatStreamChunkSchema, 
  },
  async (input, { sendChunk }) => {
    const { query, chatHistory, currentOppositionName } = input;

    let systemInstruction = `Eres OpositaBot, un asistente virtual amigable y experto para OpositaPlace. Ayudas a los usuarios a prepararse para sus oposiciones en España.
     Responde en español, de forma clara, procura ser conciso, lo que no sepas responder no lo respondas.`;
    if (currentOppositionName) {
      systemInstruction += ` El usuario está estudiando para "${currentOppositionName}".`;
    }

    let promptHistory = "";
    if (chatHistory && chatHistory.length > 0) {
      promptHistory = chatHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Usuario" : "OpositaBot"}: ${msg.content}`
        )
        .join("\n");
    }

    const fullPrompt = `
${systemInstruction}

Historial de conversación previo (si existe):
${promptHistory}

Consulta actual del Usuario: ${query}

Respuesta de OpositaBot:`;

    // Usamos ai.generateStream en lugar de ai.generate
    const responseStream = await ai.generateStream({
      // model: googleAI.model('gemini-2.0-flash'), // O usa el modelo por defecto
      prompt: fullPrompt,
      config: {
        temperature: 0.7,
      },
    });

    let accumulatedReply = "";
    for await (const chunk of responseStream.stream) {
      const textChunk = chunk.text;
      if (textChunk) {
        sendChunk({ replyChunk: textChunk }); // Enviamos el chunk según streamSchema
        accumulatedReply += textChunk;
      }
    }

    // response.response es una promesa que se resuelve con la respuesta completa del modelo
    // También podríamos usar accumulatedReply si el modelo no proporciona una respuesta final completa separada.
    const finalModelResponse = await responseStream.response;
    const fullReplyText =
      finalModelResponse.text ||
      accumulatedReply ||
      "No se pudo generar una respuesta completa.";

    return {
      fullReply: fullReplyText,
    };
  }
);
