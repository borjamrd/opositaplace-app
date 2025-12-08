import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileEdit,
  MoreHorizontal,
  Trophy,
} from 'lucide-react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReactMarkdown from 'react-markdown';
import { PracticalCaseCardAction } from '@/components/practical/practical-case-card-action';

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

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Casos Prácticos</h2>
          <p className="text-muted-foreground mt-1">
            Resuelve situaciones reales y obtén feedback inmediato con IA.
          </p>
        </div>
      </div>

      {/* Grid de Casos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cases?.map((practicalCase) => {
          const attempt = practicalCase.practical_case_attempts?.[0];
          const statusStyle = getCaseStatus(practicalCase);
          // Extraemos la nota de forma segura si existe
          const score =
            attempt?.feedback_analysis &&
            typeof attempt.feedback_analysis === 'object' &&
            'score' in attempt.feedback_analysis
              ? (attempt.feedback_analysis as any).score
              : null;

          return (
            <Card
              key={practicalCase.id}
              className="flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant="outline"
                    className={`mb-2 capitalize ${statusStyle.color} border-0 font-medium`}
                  >
                    {statusStyle.label}
                  </Badge>
                  {/* Menú de opciones rápido (opcional) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <PracticalCaseCardAction
                          caseId={practicalCase.id}
                          isPremium={isPremium}
                          variant="ghost"
                          className="w-full justify-start cursor-default"
                        >
                          Ir al caso
                        </PracticalCaseCardAction>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardTitle className="text-xl line-clamp-2 leading-tight">
                  <PracticalCaseCardAction
                    caseId={practicalCase.id}
                    isPremium={isPremium}
                    variant="link"
                    className="p-0 h-auto font-semibold text-foreground hover:underline decoration-primary/50 underline-offset-4 text-left whitespace-normal"
                  >
                    {practicalCase.title}
                  </PracticalCaseCardAction>
                </CardTitle>

                <CardDescription className="flex flex-col items-center gap-2 mt-1">
                  <ReactMarkdown>{practicalCase.statement.slice(0, 100) + '... '}</ReactMarkdown>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                {attempt?.status === 'corrected' && score !== null && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className={score >= 5 ? 'text-emerald-600' : 'text-red-600'}>
                        Nota: {score}/10
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {score >= 5 ? 'Aprobado' : 'Necesita mejorar'}
                      </span>
                    </div>
                    <Progress
                      value={score * 10}
                      className="h-2"
                      // Hack simple para color de la barra según nota (requiere CSS personalizado o usar clases condicionales en el componente Progress)
                      // Por defecto Shadcn Progress usa bg-primary
                    />
                  </div>
                )}

                {/* Si es borrador, mostramos cuándo se editó por última vez */}
                {attempt?.status === 'draft' && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 mt-2">
                    <FileEdit className="w-3 h-3" />
                    <span>
                      Editado{' '}
                      {formatDistanceToNow(new Date(attempt.updated_at!), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <PracticalCaseCardAction
                  caseId={practicalCase.id}
                  isPremium={isPremium}
                  className="w-full group"
                  variant={attempt?.status === 'corrected' ? 'outline' : 'default'}
                >
                  {attempt?.status === 'corrected' ? (
                    <>
                      Ver corrección <CheckCircle2 className="ml-2 w-4 h-4" />
                    </>
                  ) : attempt?.status === 'draft' ? (
                    <>
                      Continuar borrador{' '}
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Comenzar{' '}
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </PracticalCaseCardAction>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Empty State si hay oposiciones pero no casos */}
      {(!cases || cases.length === 0) && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Aún no hay casos prácticos</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            Parece que no hemos subido casos prácticos para tus oposiciones activas todavía. Vuelve
            pronto.
          </p>
        </div>
      )}
    </div>
  );
}
