import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/email';
import WeeklySummaryEmail from '@/emails/weekly-summary-email';
import SelectiveProcessStepReminderEmail from '@/emails/selective-process-step-reminder-email';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendWeeklySummaries() {
  const supabase = await createSupabaseServerClient();

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*, user_subscriptions!inner(status)')
    .in('user_subscriptions.status', ['active', 'trialing'])
    .neq('email', '');

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  let processed = 0;
  let failed = 0;
  const BATCH_SIZE = 2;
  const DELAY_BETWEEN_BATCHES = 1100;

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (profile) => {
      try {
        if (!profile.email) return;

        const userName = profile.username || profile.email.split('@')[0];
        const summaryData = await getSummaryForUser(profile.id);

        await sendEmail({
          to: profile.email,
          subject: 'Tu resumen semanal de Opositaplace',
          emailComponent: WeeklySummaryEmail({
            userName: userName || 'Opositor',
            summary: summaryData,
          }),
        });

        processed++;
      } catch (userError: any) {
        console.error(`Failed to process summary for user ${profile.id}:`, userError.message);
        failed++;
      }
    });

    await Promise.all(batchPromises);

    if (i + BATCH_SIZE < profiles.length) {
      await wait(DELAY_BETWEEN_BATCHES);
    }
  }

  return { processed, failed };
}

export async function sendSelectiveProcessReminders() {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  // 1. Obtener etapas que finalizan hoy
  const { data: stages, error: stagesError } = await supabase
    .from('process_stages')
    .select('*, selective_processes(name)')
    .eq('key_date', today);

  if (stagesError) {
    throw new Error(`Failed to fetch stages ending today: ${stagesError.message}`);
  }

  if (!stages || stages.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const stage of stages) {
    // 2. Obtener usuarios que siguen este proceso
    if (!stage.process_id) continue;
    const { data: userStatuses, error: statusError } = await supabase
      .from('user_process_status')
      .select('user_id, profiles(email, username)')
      .eq('process_id', stage.process_id)
      .eq('tracking_status', 'TRACKING');

    if (statusError) {
      console.error(`Error fetching users for process ${stage.process_id}:`, statusError);
      continue;
    }

    if (!userStatuses || userStatuses.length === 0) continue;

    const processName = stage.selective_processes
      ? (stage.selective_processes as any).name
      : 'Tu proceso selectivo';

    // 3. Enviar correos
    for (const status of userStatuses) {
      try {
        const profile = status.profiles as any;
        if (!profile?.email) continue;

        await sendEmail({
          to: profile.email,
          subject: `📢 Hoy finaliza: ${stage.name}`,
          emailComponent: SelectiveProcessStepReminderEmail({
            userName: profile.username || 'Opositor',
            processName: processName,
            stageName: stage.name,
          }),
        });

        processed++;
      } catch (err: any) {
        console.error(`Failed to send reminder to user ${status.user_id}:`, err.message);
        failed++;
      }
    }
  }

  return { processed, failed };
}

/**
 * Obtiene el resumen semanal real de un usuario consultando Supabase.
 */
async function getSummaryForUser(userId: string) {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  const oneWeekAgoIso = oneWeekAgo.toISOString();

  const [sessionsResult, testsResult, cardsResult] = await Promise.all([
    // A. Sesiones de estudio iniciadas en la última semana
    supabase
      .from('user_study_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .gte('started_at', oneWeekAgoIso),

    // B. Tests completados en la última semana
    supabase
      .from('test_attempts')
      .select('score')
      .eq('user_id', userId)
      .gte('finished_at', oneWeekAgoIso),

    // C. Tarjetas repasadas (Aproximación: tarjetas cuyo último repaso fue esta semana)
    // Nota: Esto cuenta tarjetas únicas repasadas, no el total de repasos si una misma se vio 2 veces.
    supabase
      .from('srs_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('last_reviewed_at', oneWeekAgoIso),
  ]);

  if (sessionsResult.error)
    throw new Error(`Error fetching sessions: ${sessionsResult.error.message}`);
  if (testsResult.error) throw new Error(`Error fetching tests: ${testsResult.error.message}`);
  if (cardsResult.error) throw new Error(`Error fetching cards: ${cardsResult.error.message}`);

  // 4. Calcular métricas

  const totalSeconds = sessionsResult.data.reduce(
    (acc, session) => acc + (session.duration_seconds || 0),
    0
  );
  const studyHours = totalSeconds / 3600;

  // -- Tests y Nota Media --
  const testsCompleted = testsResult.data.length;
  let averageScore = 0;

  if (testsCompleted > 0) {
    const totalScore = testsResult.data.reduce((acc, test) => acc + (test.score || 0), 0);
    averageScore = totalScore / testsCompleted;
  }

  const cardsReviewed = cardsResult.count || 0;

  return {
    studyHours,
    testsCompleted,
    averageScore,
    cardsReviewed,
  };
}
