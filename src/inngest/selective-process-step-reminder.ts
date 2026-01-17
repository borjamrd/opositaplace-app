import { inngest } from './client';
import { sendSelectiveProcessReminders } from '@/lib/cron/actions';

export const sendSelectiveProcessStepReminder = inngest.createFunction(
  { id: 'send-selective-process-step-reminder', retries: 3 },
  { cron: '0 7 * * *' }, //  { cron: '* * * * *' }, for testing
  async ({ step }) => {
    const result = await step.run('send-reminders', async () => {
      return await sendSelectiveProcessReminders();
    });

    return {
      message: `Selective process step reminders sent: ${result.processed} processed, ${result.failed} failed`,
      result,
    };
  }
);
