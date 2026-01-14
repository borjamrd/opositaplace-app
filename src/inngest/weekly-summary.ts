import { inngest } from './client';
import { sendWeeklySummaries } from '@/lib/cron/actions';

export const sendWeeklyDigest = inngest.createFunction(
  { id: 'send-weekly-digest-email' },
  { cron: '*/0 9 * * MON' }, // Runs every 3 minutes for testing (0 9 * * MON)
  async () => {
    const result = await sendWeeklySummaries();
    return {
      message: `Weekly summaries sent: ${result.processed} processed, ${result.failed} failed`,
      result,
    };
  }
);
