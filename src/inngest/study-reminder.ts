import { inngest } from './client';
import { sendStudyReminders } from '@/lib/cron/study-reminder';

export const studyReminderCron = inngest.createFunction(
  { id: 'study-reminder-cron', retries: 0 },
  { cron: '0 9 * * 1-5' }, // Every weekday at 9:00 AM
  async ({ step }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Mock: Enviando recordatorios de estudio...');
      return { sent: 0, mocked: true };
    }
    const result = await step.run('send-study-reminders', async () => {
      // The logic inside sends e-mails to users inactive for >72h
      return await sendStudyReminders();
    });

    return {
      message: `Study reminders execution completed.`,
      result,
    };
  }
);
