import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { correctPracticalCase } from '../../../inngest/functions';
import { sendWeeklyDigest } from '../../../inngest/weekly-summary';

// Create an API that serves the functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [correctPracticalCase, sendWeeklyDigest],
});
