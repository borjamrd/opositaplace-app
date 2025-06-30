// ai/tools/knowledgeSearchTool.ts
import { ConversationalSearchServiceClient } from '@google-cloud/discoveryengine/build/src/v1alpha';
import type { protos } from '@google-cloud/discoveryengine';

export interface Reference {
    id: string; // Usaremos el ID del documento como clave
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

// --- Configuración del Cliente ---
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
        },
    };

    try {
        const [response] = await conversationalSearchClient.answerQuery(request);
        const answer = response.answer;

        // Procesamos las referencias para que tengan un formato limpio y útil
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
