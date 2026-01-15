import { inngest } from './client';
import { sendWeeklySummaries } from '@/lib/cron/actions';

export const sendWeeklyDigest = inngest.createFunction(
  { id: 'send-weekly-digest-email', retries: 3 },
  { cron: '*/3 * * * *' },
  async ({ step }) => {
    const result = await step.run('process-summaries', async () => {
      return await sendWeeklySummaries();
    });

    return {
      message: `Weekly summaries sent: ${result.processed} processed, ${result.failed} failed`,
      result,
    };
  }
);
