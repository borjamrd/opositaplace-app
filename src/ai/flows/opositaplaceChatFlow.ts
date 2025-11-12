// ai/flows/opositaplaceChatFlow.ts
import { ai } from '@/ai/genkit';
import { getConversationalAnswer, Reference } from '@/ai/tools/knowledgeSearchTool';
import { UserSessionData } from '@/lib/supabase/types';
import { z } from 'genkit';

async function streamText(
  text: string,
  sendChunk: (chunk: { replyChunk?: string; statusUpdate?: string | null }) => void
) {
  const words = text.split(/(\s+)/);

  sendChunk({ statusUpdate: null });

  for (const word of words) {
    sendChunk({ replyChunk: word });

    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
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
  replyChunk: z.string().optional(),
  statusUpdate: z.string().optional().nullable(),
});

export const opositaplaceChatFlow = ai.defineFlow(
  {
    name: 'opositaplaceChatFlow',
    inputSchema: OpositaPlaceChatInputSchema,
    outputSchema: OpositaPlaceChatFinalOutputSchema,
    streamSchema: OpositaPlaceChatStreamChunkSchema,
  },
  async (input, { sendChunk, context }) => {
    const { query, sessionPath, chatHistory } = input;

    const { sessionData } = context as { sessionData: UserSessionData };

    let finalAnswerText: string | null = null;
    let references: Reference[] = [];
    let finalSessionPath: string | null = sessionPath || null;

    const profile = sessionData?.profile;
    const activeOpposition = sessionData?.activeOpposition;
    const activeStudyCycle = sessionData?.activeStudyCycle;
    const onboardingInfo = sessionData?.profile?.onboarding;

    // Lógica de parseo de objetivos
    let objectiveString = 'aprobar su oposición';
    if (profile?.onboarding?.objectives) {
      try {
        // Asumimos que 'objective' puede ser un string JSON de un array
        const objectivesArray = JSON.parse(profile.onboarding.objectives as string);
        if (Array.isArray(objectivesArray) && objectivesArray.length > 0) {
          objectiveString = objectivesArray.join(', ');
        }
      } catch (e) {
        if (typeof profile.onboarding.objectives === 'string') {
          objectiveString = profile.onboarding.objectives;
        }
      }
    }

    let studyDaysString = '';
    const studyDaysData = onboardingInfo?.study_days;
    if (studyDaysData && typeof studyDaysData === 'object' && !Array.isArray(studyDaysData)) {
      const daySummaries: string[] = [];

      // Iteramos sobre los días (Lunes, Martes, Domingo, etc.)
      for (const [day, slotsObject] of Object.entries(studyDaysData)) {
        if (slotsObject && typeof slotsObject === 'object') {
          // Filtramos solo los slots marcados como 'true'
          const activeSlots = Object.entries(slotsObject)
            .filter(([slotTime, isScheduled]) => isScheduled === true)
            .map(([slotTime]) => slotTime); // Obtenemos la hora (ej: "12:00 - 13:00")

          if (activeSlots.length > 0) {
            // Creamos un resumen para ese día
            daySummaries.push(`${day} (${activeSlots.join(', ')})`);
          }
        }
      }

      if (daySummaries.length > 0) {
        studyDaysString = `Sus bloques de estudio programados son: ${daySummaries.join('; ')}.`;
      }
    }
    // 3. Obtener Horas de Estudio Semanales (number | null)
    let weeklyGoalString = '';
    if (onboardingInfo?.weekly_study_goal_hours) {
      weeklyGoalString = `Su objetivo de estudio semanal es de ${onboardingInfo.weekly_study_goal_hours} horas.`;
    }

    // 4. Obtener Duración de Bloques (number)
    let slotDurationString = '';
    if (onboardingInfo?.slot_duration_minutes) {
      slotDurationString = `Suele estudiar en bloques de ${onboardingInfo.slot_duration_minutes} minutos.`;
    }

    const profileName = profile?.username || 'el usuario';
    const activeOppositionName = activeOpposition?.name || 'ninguna';

    let systemPrompt = `
      Eres Pompe, una asistente experta para opositores.
      Estás hablando con ${profileName}, cuyo objetivo principal es "${objectiveString}".
    `;

    if (activeOpposition) {
      systemPrompt += `\nActualmente está estudiando la oposición: ${activeOpposition.name}.`;
    }
    if (activeStudyCycle) {
      systemPrompt += `\nEstá en la vuelta (ciclo de estudio) número ${activeStudyCycle.cycle_number}.`;
    }
    if (studyDaysString) {
      systemPrompt += `\n${studyDaysString}`;
    }
    if (weeklyGoalString) {
      systemPrompt += `\n${weeklyGoalString}`;
    }

    systemPrompt += `
      Tu tono debe ser profesional y solo cuando el usuario esté frustado ser motivador, si no permanece serio.
      Basa tus respuestas en el conocimiento proporcionado.
    `;

    const intentPrompt = `
            ${systemPrompt}

            Clasifica la intención de la siguiente "Consulta del usuario" en una de estas categorías:

            - KNOWLEDGE_QUERY: El usuario hace una pregunta específica sobre el temario de oposiciones.
            - CLARIFICATION_REQUEST: El usuario pide una aclaración, un ejemplo, o dice que no entiende la respuesta anterior.
            - CAPABILITIES_INQUIRY: El usuario pregunta sobre las capacidades del bot.
            - CONVERSATIONAL_RESPONSE: El usuario da una respuesta corta y conversacional (gracias, hola, ok).
            - CONTEXTUAL_QUERY: El usuario pregunta sobre sí mismo o sobre cualquier aspecto relacionado con su progreso 
              (ej: "cómo me llamo", "qué oposición estudio", "qué tareas tengo", "cómo me han ido en los tests", 
              "horas de estudio registradas en la plataforma") o sobre el bot (ej: "quién eres tú").
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

    sendChunk({ statusUpdate: 'Analizando intención del usuario...' });
    await new Promise((resolve) => setTimeout(resolve, 100));

    switch (intent) {
      case 'KNOWLEDGE_QUERY':
        sendChunk({ statusUpdate: 'Resolviendo de forma estructurada las dudas...' });
        try {
          const ragResult = await getConversationalAnswer(query, sessionPath, systemPrompt);
          references = ragResult.references;
          finalSessionPath = ragResult.sessionPath;
          finalAnswerText = ragResult.answer;

          if (!finalAnswerText) {
            finalAnswerText =
              'Lo siento, no pude encontrar información relevante para tu consulta.';
          }
          await streamText(finalAnswerText, sendChunk);
        } catch (e) {
          finalAnswerText = 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
          sendChunk({ replyChunk: finalAnswerText });
        }
        break;

      case 'CLARIFICATION_REQUEST':
        try {
          if (chatHistory && chatHistory.length > 0) {
            const lastBotResponse = chatHistory
              .filter((msg) => msg.role === 'model' && msg.content !== '...')
              .pop();

            if (lastBotResponse) {
              const clarificationIntentPrompt = `
                La respuesta anterior del bot fue: "${lastBotResponse.content.substring(0, 500)}..."
                La nueva consulta del usuario es: "${query}"

                Clasifica la consulta del usuario en una de estas dos categorías:
                - FOLLOW_UP: El usuario pide más detalles, un ejemplo, o una aclaración sobre la respuesta anterior.
                - CORRECTION: El usuario indica que la respuesta anterior era incorrecta, que se refería a otra cosa, o está cambiando de tema.
                Responde solo con la categoría (FOLLOW_UP o CORRECTION).
              `;

              const intentResult = await ai.generate({
                prompt: clarificationIntentPrompt,
                output: { format: 'text' },
                config: { temperature: 0.0 },
              });
              const subIntent = intentResult.text.trim();

              let queryToUse = query;
              let systemPromptToUse = systemPrompt;

              // 2. Actúa según la sub-intención
              if (subIntent === 'FOLLOW_UP') {
                queryToUse = `El usuario tiene una duda sobre esta respuesta: "${lastBotResponse.content.substring(0, 1500)}". La nueva pregunta del usuario es: "${query}".`;
              } else {
                queryToUse = query;
                systemPromptToUse = `${systemPrompt}\nIMPORTANTE: El usuario está corrigiendo mi respuesta anterior. Ignora el contexto previo y céntrate solo en la nueva consulta.`;
              }

              // 3. Llama al RAG con la consulta y el prompt correctos
              const ragResult = await getConversationalAnswer(
                queryToUse,
                sessionPath,
                systemPromptToUse
              );

              references = ragResult.references;
              finalSessionPath = ragResult.sessionPath;
              finalAnswerText = ragResult.answer as string;
              await streamText(finalAnswerText, sendChunk);
            } else {
              finalAnswerText = 'Por favor, ¿puedes recordarme sobre qué tenías la duda?';
              sendChunk({ replyChunk: finalAnswerText });
            }
          } else {
            finalAnswerText = '¿Podrías darme un poco más de contexto sobre lo que no entiendes?';
            sendChunk({ replyChunk: finalAnswerText });
          }
        } catch (e) {
          console.error('Error during clarification request:', e);
          finalAnswerText = 'Lo siento, ha ocurrido un error al intentar aclarar la respuesta.';
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

          await streamText(finalAnswerText, sendChunk);
        } catch (e) {
          finalAnswerText = 'Lo siento, ha ocurrido un error al mostrar mis capacidades.';
          sendChunk({ replyChunk: finalAnswerText });
        }
        references = [];
        break;

      case 'CONVERSATIONAL_RESPONSE':
        try {
          const conversationalPrompt = `
                        ${systemPrompt} OpositaPlaceChatStreamChunkSchema

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
      case 'CONTEXTUAL_QUERY':
        try {
          const contextualPrompt = `
                        ${systemPrompt} // (El systemPrompt tiene el nombre: "Estás hablando con ${profileName}...")

                        El usuario ha hecho una pregunta sobre sí mismo, sobre ti, o sobre el contexto de la conversación.
                        Su pregunta fue: "${query}"
                        
                        Responde a esta pregunta de forma breve y amable usando la información de tu system prompt.
                        Por ejemplo, si pregunta su nombre, usa el nombre "${profileName}".
                        Si pregunta por su oposición, usa "${activeOppositionName}".
                    `;
          const data = await ai.generate({
            prompt: contextualPrompt,
            output: { format: 'text' },
            config: { temperature: 0.7 },
          });
          finalAnswerText = data?.text.trim() || 'No estoy seguro de cómo responder a eso.';

          await streamText(finalAnswerText, sendChunk);
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
