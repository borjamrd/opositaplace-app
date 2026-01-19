// app/dashboard/tests/page.tsx
import { TestHistoryChart } from '@/components/charts/test-history-chart';
import { NewTestModal } from '@/components/tests/new-test-modal';
import { TestHistoryTable } from '@/components/tests/test-history-table';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateTestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = await searchParams;

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

  // Pagination parameters
  const LIMIT = 10;
  const offset =
    typeof resolvedSearchParams.offset === 'string' ? parseInt(resolvedSearchParams.offset, 10) : 0;

  const {
    data: testAttempts,
    error: attemptsError,
    count,
  } = await supabase
    .from('test_attempts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (attemptsError) {
    console.error('Error fetching test history:', attemptsError.message);
  }

  const { data: blocksWithTopics, error } = await supabase
    .from('blocks')
    .select('id, name, topics(id, name, position)')
    .eq('opposition_id', activeUserOpposition.opposition_id)
    .order('position', { ascending: true })
    .order('position', { referencedTable: 'topics', ascending: true });

  if (error) return <p>Error al cargar el temario.</p>;

  const { data: exams } = await supabase
    .from('exams')
    .select('id, name')
    .eq('opposition_id', activeUserOpposition.opposition_id)
    .order('created_at', { ascending: false });

  const totalTests = count || 0;
  const hasNextPage = offset + LIMIT < totalTests;
  const hasPrevPage = offset > 0;

  return (
    <div className="container mx-auto pb-10">
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

        {/* Pagination Controls */}
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {testAttempts?.length || 0} de {totalTests} tests
          </div>
          <div className="flex gap-2">
            {hasPrevPage ? (
              <Link
                href={`/dashboard/tests?offset=${Math.max(0, offset - LIMIT)}`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Anterior
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background opacity-50 cursor-not-allowed h-9 px-4 py-2"
              >
                Anterior
              </button>
            )}

            {hasNextPage ? (
              <Link
                href={`/dashboard/tests?offset=${offset + LIMIT}`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Siguiente
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background opacity-50 cursor-not-allowed h-9 px-4 py-2"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
