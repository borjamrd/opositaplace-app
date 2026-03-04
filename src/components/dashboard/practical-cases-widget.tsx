'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Loader2, FileText } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useStudySessionStore } from '@/store/study-session-store';
import { PracticalCase, PracticalCaseAttempt } from '@/lib/supabase/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '../ui/empty';

interface InProgressCase {
  attempt: PracticalCaseAttempt;
  practicalCase: Pick<PracticalCase, 'id' | 'title' | 'difficulty'>;
}

interface PracticalCasesWidgetProps {
  href?: string;
}

const statusLabels: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: { label: 'En progreso', variant: 'secondary' },
  corrected: { label: 'Corregido', variant: 'default' },
  pending: { label: 'Pendiente de corrección', variant: 'outline' },
};

const difficultyLabels: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

export function PracticalCasesWidget({ href }: PracticalCasesWidgetProps) {
  const { activeOpposition } = useStudySessionStore();
  const [inProgressCase, setInProgressCase] = useState<InProgressCase | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLatestAttempt = async () => {
      if (!activeOpposition) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch the most recent attempt for cases in this opposition
        const { data } = await supabase
          .from('practical_case_attempts')
          .select(
            `
            *,
            practical_cases!inner(id, title, difficulty, opposition_id)
          `
          )
          .eq('user_id', user.id)
          .eq('practical_cases.opposition_id', activeOpposition.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const { practical_cases, ...attempt } = data as any;
          setInProgressCase({
            attempt: attempt as PracticalCaseAttempt,
            practicalCase: practical_cases,
          });
        } else {
          setInProgressCase(null);
        }
      } catch (err) {
        console.error('Error fetching practical case attempt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAttempt();
  }, [activeOpposition]);

  if (!activeOpposition) return null;

  const statusInfo = inProgressCase
    ? (statusLabels[inProgressCase.attempt.status as keyof typeof statusLabels] ?? {
        label: inProgressCase.attempt.status,
        variant: 'outline' as const,
      })
    : null;

  return (
    <Card className="h-full flex flex-col relative w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Caso práctico</CardTitle>
          </div>
          <CardDescription>Tu último caso práctico en curso</CardDescription>
        </div>
        {href && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full border border-primary text-primary hover:bg-primary/20 hover:text-primary"
            asChild
          >
            <Link href={href}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-grow pt-2 flex flex-col justify-center">
        {loading ? (
          <div className="flex h-[120px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : inProgressCase ? (
          <div className="group block rounded-lg transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate transition-colors">
                    {inProgressCase.practicalCase.title}
                  </p>
                </div>
              </div>
              {statusInfo && (
                <Badge variant={statusInfo.variant} className="shrink-0 text-xs">
                  {statusInfo.label}
                </Badge>
              )}
            </div>
            {inProgressCase.attempt.user_answer && (
              <div
                className="mt-3 text-xs text-muted-foreground line-clamp-4 pl-8"
                dangerouslySetInnerHTML={{ __html: inProgressCase.attempt.user_answer }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Empty className="border-dashed">
              <EmptyHeader>
                <EmptyTitle>Sin casos iniciados</EmptyTitle>
                <EmptyDescription>Todavía no has comenzado ningún caso práctico.</EmptyDescription>
              </EmptyHeader>
              {href && (
                <EmptyContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={href}>Ver casos prácticos</Link>
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
