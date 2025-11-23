import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPracticalCaseWithAttempt } from '@/actions/practical-cases';
import { PracticalCaseView } from '@/components/practical/practical-case-view';
import { PracticalCaseAttemptWithAnalysis } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticalCasePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Seguridad: Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Obtener Datos (Server Action o Query directa)
  // Usamos el action que creamos antes para centralizar la lógica
  const { caseData, attemptData, error } = await getPracticalCaseWithAttempt(id);

  if (error || !caseData) {
    console.error('Error cargando caso:', error);
    return notFound();
  }

  // 3. Renderizar Cliente
  return (
    <PracticalCaseView
      caseData={caseData}
      initialAttempt={attemptData as PracticalCaseAttemptWithAnalysis}
    />
  );
}
