// ai/tools/knowledgeSearchTool.ts
import { ConversationalSearchServiceClient } from '@google-cloud/discoveryengine/build/src/v1alpha';
import type { protos } from '@google-cloud/discoveryengine';

export interface Reference {
    id: string; 
    text: string;
    link: string;
    pageIdentifier: string;
    title: string;
}

export interface ConversationalResult {
    answer: string | null;
    references: Reference[];
    sessionPath: string | null;
}

const projectId = process.env.GCP_PROJECT_ID!;
const location = 'eu';
const collectionId = 'default_collection';
const engineId = 'opositaplace-asistente-tem_1751041614341';
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
const apiEndpoint = 'eu-discoveryengine.googleapis.com';

const conversationalSearchClient = new ConversationalSearchServiceClient({
    credentials,
    apiEndpoint,
});

const servingConfigPath =
    conversationalSearchClient.projectLocationCollectionEngineServingConfigPath(
        projectId,
        location,
        collectionId,
        engineId,
        'default_config'
    );

/**
 * Llama al endpoint :answer de Vertex AI. Si no se proporciona una sesión,
 * crea una nueva usando el modo automático.
 * @param query La pregunta del usuario.
 * @param existingSessionPath La ruta de la sesión actual (opcional).
 * @returns Un objeto con la respuesta generada y la ruta de la sesión.
 */
export async function getConversationalAnswer(
    query: string,
    existingSessionPath?: string
): Promise<ConversationalResult> {
    const sessionPath =
        existingSessionPath ||
        conversationalSearchClient.projectLocationCollectionEngineSessionPath(
            projectId,
            location,
            collectionId,
            engineId,
            '-'
        );

    const request: protos.google.cloud.discoveryengine.v1alpha.IAnswerQueryRequest = {
        servingConfig: servingConfigPath,
        query: {
            text: query,
        },
        session: sessionPath,
        answerGenerationSpec: {
            modelSpec: {
                modelVersion: 'preview',
            },
            includeCitations: true,
            promptSpec: {
                preamble: `Eres OpositaBot, un asistente virtual experto y amigable para la plataforma OpositaPlace. Tu único propósito es ayudar a los usuarios a estudiar sus oposiciones basándote en la información que se te proporciona.

                        **Reglas Fundamentales:**

                        1.  **Contexto es Rey:** Basa tu respuesta ÚNICA Y EXCLUSIVAMENTE en el contexto y las fuentes que se te entregan en esta petición. No uses ningún conocimiento externo que puedas tener.
                        2.  **Cita tus Fuentes:** Es obligatorio que cites la fuente de cada afirmación que hagas. Usa el formato [número] al final de la frase o párrafo correspondiente. La respuesta debe estar respaldada por las referencias.
                        3.  **Si no lo sabes, dilo:** Si la respuesta a la pregunta del usuario no se encuentra en el contexto proporcionado, es crucial que respondas honestamente. Di algo como: "No he encontrado información específica sobre ese punto en el temario proporcionado." o "El documento no detalla ese aspecto.". NUNCA inventes una respuesta.
                        4.  **Sé un Asistente, no un Consejero:** No des opiniones personales, consejos legales, ni estrategias de estudio. Cíñete a explicar el contenido del temario.
                        5.  **Formato Claro:** Utiliza Markdown (listas, negritas) para que tus respuestas sean claras y fáciles de leer. Responde siempre en español.
                        
                        Salvo que no lo veas necesario, no incluyas un saludo inicial o una despedida. Tu objetivo es ser directo y útil, proporcionando información precisa y relevante basada en el contexto que se te ha proporcionado.
                        Si has ofrecido una respuesta, puedes preguntar si el usuario necesita más información o si hay algo más en lo que puedas ayudar, pero siempre basándote en el contexto proporcionado.
                        `,
            },
        },
    };

    try {
        const [response] = await conversationalSearchClient.answerQuery(request);
        const answer = response.answer;

        const references: Reference[] = (answer?.references || []).map((ref) => ({
            id: ref.chunkInfo?.documentMetadata?.document || Math.random().toString(),
            text: ref.chunkInfo?.content || 'Contenido no disponible.',
            link: ref.chunkInfo?.documentMetadata?.uri || '#',
            pageIdentifier: ref.chunkInfo?.documentMetadata?.pageIdentifier || 'N/A',
            title: ref.chunkInfo?.documentMetadata?.title || 'Fuente desconocida',
        }));

        return {
            answer: answer?.answerText || 'No se encontró una respuesta directa.',
            references: references, // Devolvemos el array procesado
            sessionPath: response.session?.name || null,
        };
    } catch (error) {
        console.error('Error in getConversationalAnswer:', error);
        return { answer: 'Hubo un error...', references: [], sessionPath: null };
    }
}
