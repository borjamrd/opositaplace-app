// app/dashboard/tests/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateTestForm } from '@/components/tests/create-test-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CreateTestPage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

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

    const { data: blocksWithTopics, error } = await supabase
        .from('blocks')
        .select('id, name, topics(id, name)')
        .eq('opposition_id', activeUserOpposition.opposition_id)
        .order('position', { ascending: true });

    if (error) return <p>Error al cargar el temario.</p>;


    return (
        <div className="container mx-auto py-10">
            <CreateTestForm
                blocksWithTopics={blocksWithTopics || []}
                oppositionId={activeUserOpposition.opposition_id}
            />
        </div>
    );
}
