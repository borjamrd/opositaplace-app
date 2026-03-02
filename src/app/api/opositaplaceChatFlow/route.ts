// En: src/app/api/opositaplaceChatFlow/route.ts
import { opositaplaceChatFlow } from '@/ai/flows/opositaplaceChatFlow';
import { appRoute } from '@genkit-ai/next';
import '@/ai/dev';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export const POST = appRoute(opositaplaceChatFlow, {
  contextProvider: async () => {
    const sessionData = await getSessionData();

    if (!sessionData.profile) {
      throw new Error('Unauthorized');
    }
    return { sessionData };
  },
});
