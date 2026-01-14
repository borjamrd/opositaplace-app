import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { correctPracticalCase } from '../../../inngest/functions';

// Create an API that serves the functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [correctPracticalCase],
});
