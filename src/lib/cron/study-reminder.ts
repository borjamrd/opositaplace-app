import StudyReminderEmail from '@/emails/study-reminder-email';
import { sendEmail } from '@/lib/email/email';
import { createSupabaseAdminClient } from '../supabase/admin';

export async function sendStudyReminders() {
  console.log('Starting sendStudyReminders');
  const now = new Date();
  const dayOfWeek = now.getDay();

  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log('Weekend, skipping study reminders.');
    return { processed: 0, failed: 0, skipped: true };
  }

  const supabase = createSupabaseAdminClient();

  // 72 hours ago
  const limitDate = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

  // 1. Get all active users (active or trialing subscription)
  // We prioritize users who have at least logged in or have some activity history usually,
  // but the requirement is generic for active users.
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, username, user_subscriptions!inner(status)')
    .in('user_subscriptions.status', ['active', 'trialing'])
    .neq('email', '');

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    console.log('No active profiles found.');
    return { processed: 0, failed: 0 };
  }

  // 2. Get users who HAVE studied in the last 72 hours
  const { data: recentSessions, error: sessionsError } = await supabase
    .from('user_study_sessions')
    .select('user_id')
    .gte('started_at', limitDate);

  if (sessionsError) {
    throw new Error(`Failed to fetch recent sessions: ${sessionsError.message}`);
  }

  const recentUserIds = new Set(recentSessions?.map((s) => s.user_id).filter(Boolean) || []);

  // 3. Filter users who have NOT studied recently
  const inactiveUsers = profiles.filter((user) => !recentUserIds.has(user.id));

  console.log(
    `Found ${inactiveUsers.length} inactive users out of ${profiles.length} active profiles.`
  );

  let processed = 0;
  let failed = 0;

  // 4. Send emails
  // Using sequential loop with delay if needed, or Promise.all.
  // For safety like in weekly-summary, we can process in batches if the list is huge.
  // Assuming reasonable volume for now, but sticking to batch pattern is good practice.

  const BATCH_SIZE = 10;
  const DELAY_BETWEEN_BATCHES = 1000;

  for (let i = 0; i < inactiveUsers.length; i += BATCH_SIZE) {
    const batch = inactiveUsers.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (user) => {
      try {
        if (!user.email) return;

        await sendEmail({
          to: user.email,
          subject: '¿Echamos un rato de estudio? 📚',
          emailComponent: StudyReminderEmail({
            userName: user.username || 'Opositor',
          }),
        });
        processed++;
      } catch (error: any) {
        console.error(`Failed to send reminder to user ${user.id}:`, error.message);
        failed++;
      }
    });

    await Promise.all(batchPromises);

    if (i + BATCH_SIZE < inactiveUsers.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return { processed, failed };
}
