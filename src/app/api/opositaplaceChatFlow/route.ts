import { opositaplaceChatFlow } from '@/ai/flows/opositaplaceChatFlow';
import { appRoute } from '@genkit-ai/next';
import '@/ai/dev';

export const POST = appRoute(opositaplaceChatFlow);
