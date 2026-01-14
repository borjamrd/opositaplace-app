import { inngest } from './client';
import { correctPracticalCaseFlow } from '@/ai/flows/correction-flow';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const correctPracticalCase = inngest.createFunction(
  { id: 'correct-practical-case' },
  { event: 'practical-case/correct' },
  async ({ event, step }) => {
    const { caseId, userId, userAnswer, jobId } = event.data;

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // 1. Fetch Case Data
    const caseData = await step.run('fetch-case-data', async () => {
      // Update job status to processing
      await supabase
        .from('practical_case_correction_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      const { data, error } = await supabase
        .from('practical_cases')
        .select('statement, official_solution, evaluation_criteria')
        .eq('id', caseId)
        .single();

      if (error || !data) throw new Error('Case not found');
      return data;
    });

    // 2. Run AI Correction
    const correctionResult = await step.run('ai-correction', async () => {
      const criteriaList = Array.isArray(caseData.evaluation_criteria)
        ? caseData.evaluation_criteria.map(String)
        : [];

      return await correctPracticalCaseFlow({
        statement: caseData.statement,
        official_solution: caseData.official_solution,
        user_answer: userAnswer,
        evaluation_criteria: criteriaList,
      });
    });

    // 3. Save Results
    await step.run('save-results', async () => {
      // Update the attempt with the result
      const { error: attemptError } = await supabase.from('practical_case_attempts').upsert(
        {
          user_id: userId,
          case_id: caseId,
          user_answer: userAnswer,
          feedback_analysis: correctionResult,
          status: 'corrected',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, case_id' }
      );

      if (attemptError) throw new Error(`Error saving attempt: ${attemptError.message}`);

      // Update the job status to completed
      const { error: jobError } = await supabase
        .from('practical_case_correction_jobs')
        .update({
          status: 'completed',
          result: correctionResult,
        })
        .eq('id', jobId);

      if (jobError) throw new Error(`Error updating job: ${jobError.message}`);
    });

    return correctionResult;
  }
);
