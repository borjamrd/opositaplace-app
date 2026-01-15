// app/dashboard/tests/page.tsx
import { TestHistoryChart } from '@/components/charts/test-history-chart';
import { NewTestModal } from '@/components/tests/new-test-modal';
import { TestHistoryTable } from '@/components/tests/test-history-table';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateTestPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: activeUserOpposition } = await supabase
    .from('user_oppositions')
    .select('opposition_id')
    .eq('profile_id', user.id)
    .eq('active', true)
    .single();

  if (!activeUserOpposition?.opposition_id) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>
          Por favor,{' '}
          <Link href="/dashboard/profile" className="underline text-primary">
            selecciona una oposición activa
          </Link>
          .
        </p>
      </div>
    );
  }

  const { data: testAttempts, error: attemptsError } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (attemptsError) {
    console.error('Error fetching test history:', attemptsError.message);
  }

  const { data: blocksWithTopics, error } = await supabase
    .from('blocks')
    .select('id, name, topics(id, name)')
    .eq('opposition_id', activeUserOpposition.opposition_id)
    .order('position', { ascending: true });

  if (error) return <p>Error al cargar el temario.</p>;

  const { data: exams } = await supabase
    .from('exams')
    .select('id, name')
    .eq('opposition_id', activeUserOpposition.opposition_id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <NewTestModal
            blocksWithTopics={blocksWithTopics || []}
            oppositionId={activeUserOpposition.opposition_id}
            exams={exams || []}
          />
        </div>

        <TestHistoryChart />
        <TestHistoryTable attempts={testAttempts || []} />
      </div>
    </div>
  );
}
