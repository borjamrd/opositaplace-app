import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { correctPracticalCase } from '../../../inngest/functions';
import { sendWeeklyDigest } from '../../../inngest/weekly-summary';
import { sendSelectiveProcessStepReminder } from '../../../inngest/selective-process-step-reminder';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [correctPracticalCase, sendWeeklyDigest, sendSelectiveProcessStepReminder],
});
