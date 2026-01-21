import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, ChevronRight, FileEdit, Trophy } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FeaturedCaseCard } from '@/components/practical/featured-case-card';
import { cn } from '@/lib/utils';
import { PracticalCaseLink } from '@/components/practical/practical-case-link';
import ReactMarkdown from 'react-markdown';
import { PageContainer } from '@/components/page-container';

export const metadata: Metadata = {
  title: 'Casos prácticos | Opositaplace',
  description:
    'Comprueba lo aprendido durante tu estudio realizando estos casos prácticos. Se corrigen en el momento.',
};

export default async function PracticalCasesListPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Obtener las oposiciones activas del usuario para filtrar
  const { data: userOpos } = await supabase
    .from('user_oppositions')
    .select('opposition_id')
    .eq('profile_id', user.id)
    .eq('active', true);

  const oppositionIds =
    userOpos?.map((uo) => uo.opposition_id).filter((id): id is string => id !== null) || [];

  // 2. Verificar suscripción (Premium Check)
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('status, price_id')
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  const isPremium =
    subscription?.price_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID ||
    subscription?.price_id === 'price_premium_placeholder';

  if (oppositionIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <BookOpen className="w-16 h-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold">No tienes oposiciones activas</h2>
        <p className="text-muted-foreground">
          Suscríbete a una oposición para ver sus casos prácticos.
        </p>
        <Button asChild variant="default">
          <Link href="/dashboard/oposiciones">Explorar Oposiciones</Link>
        </Button>
      </div>
    );
  }

  const { data: cases, error } = await supabase
    .from('practical_cases')
    .select(
      `
      *,
      oppositions ( name ),
      practical_case_attempts (
        status,
        updated_at,
        feedback_analysis
      )
    `
    )
    .in('opposition_id', oppositionIds)
    .eq('practical_case_attempts.user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
    return <div>Error cargando los casos prácticos.</div>;
  }

  // Función auxiliar para calcular el estado visual
  const getCaseStatus = (c: any) => {
    const attempt = c.practical_case_attempts?.[0];
    if (!attempt)
      return { label: 'Sin empezar', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (attempt.status === 'draft')
      return { label: 'Borrador', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (attempt.status === 'corrected')
      return { label: 'Corregido', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    return { label: 'Enviado', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  // Lógica para Featured Case vs Other Cases
  // Buscamos el caso más reciente que tenga un intento (borrador, enviado, corregido)
  // Ordenamos por fecha de actualización del intento
  const casesWithAttempts = cases?.filter((c) => c.practical_case_attempts?.length > 0) || [];

  const sortedActiveCases = [...casesWithAttempts].sort((a, b) => {
    const dateA = new Date(a.practical_case_attempts[0].updated_at ?? 0).getTime();
    const dateB = new Date(b.practical_case_attempts[0].updated_at ?? 0).getTime();
    return dateB - dateA;
  });

  const featuredCase = sortedActiveCases.length > 0 ? sortedActiveCases[0] : null;

  // El resto de casos son todos los que no son el featuredCase
  const otherCases =
    cases
      ?.filter((c) => c.id !== featuredCase?.id)
      .map((c) => {
        return {
          ...c,
          statement: c.statement.slice(0, 200) + '...',
        };
      }) || [];

  return (
    <PageContainer title="Casos prácticos">
      <div className="h-[calc(100vh-11rem)] flex flex-col gap-6 overflow-hidden">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Contenedor Izquierdo: Caso Destacado */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Limitamos la altura en mobile/tablet, pero en desktop dejamos que ocupe el grid */}
            <div className="h-full flex flex-col">
              <FeaturedCaseCard
                practicalCase={featuredCase}
                isPremium={isPremium}
                className="flex-1"
              />
            </div>
          </div>

          {/* Contenedor Derecho: Resto de casos */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-primary text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Más casos disponibles
              </h3>
              <Badge variant="secondary">{otherCases.length}</Badge>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pb-2">
              {otherCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Trophy className="w-12 h-12 mb-2 text-slate-300" />
                  <p>No hay más casos disponibles por ahora.</p>
                </div>
              ) : (
                otherCases.map((practicalCase) => {
                  const attempt = practicalCase.practical_case_attempts?.[0];
                  const statusStyle = getCaseStatus(practicalCase);
                  const score =
                    attempt?.feedback_analysis &&
                    typeof attempt.feedback_analysis === 'object' &&
                    'score' in attempt.feedback_analysis
                      ? (attempt.feedback_analysis as any).score
                      : null;

                  return (
                    <Card
                      key={practicalCase.id}
                      className="flex flex-col hover:shadow-md transition-all hover:border-primary/40 group border-slate-200/60 dark:border-slate-800"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 ${statusStyle.color} border-0 font-medium uppercase tracking-wider`}
                          >
                            {statusStyle.label}
                          </Badge>
                          {attempt?.status === 'draft' && attempt.updated_at && (
                            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                              <FileEdit className="w-3 h-3" />{' '}
                              {formatDistanceToNow(new Date(attempt.updated_at), { locale: es })}
                            </span>
                          )}
                        </div>

                        <CardTitle className="text-base line-clamp-1 mt-1 font-semibold leading-tight">
                          <PracticalCaseLink
                            href={`/dashboard/practical-cases/${practicalCase.id}`}
                            className="hover:text-primary transition-colors"
                            isPremium={isPremium!}
                          >
                            {practicalCase.title}
                          </PracticalCaseLink>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 flex-1 min-h-[60px]">
                        <div className={`text-xs text-muted-foreground line-clamp-2 blur-[2px]`}>
                          <ReactMarkdown allowedElements={['p', 'strong', 'em', 'text']}>
                            {practicalCase.statement}
                          </ReactMarkdown>
                        </div>
                      </CardContent>

                      <CardFooter className="p-3 bg-muted/30 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                        {attempt?.status === 'corrected' && score !== null ? (
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <span
                              className={cn(
                                'text-xs font-bold',
                                score >= 5 ? 'text-emerald-600' : 'text-red-600'
                              )}
                            >
                              {score}/10
                            </span>
                            <Progress value={score * 10} className="h-1.5 flex-1" />
                          </div>
                        ) : (
                          <div className="flex-1"></div>
                        )}

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs hover:bg-white hover:shadow-sm dark:hover:bg-slate-800"
                        >
                          <PracticalCaseLink
                            href={`/dashboard/practical-cases/${practicalCase.id}`}
                            isPremium={isPremium!}
                          >
                            {attempt?.status === 'corrected'
                              ? 'Ver corrección'
                              : attempt?.status === 'draft'
                                ? 'Continuar'
                                : 'Comenzar'}
                            <ChevronRight className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </PracticalCaseLink>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
