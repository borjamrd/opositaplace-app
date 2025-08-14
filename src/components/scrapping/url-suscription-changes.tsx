// src/components/scrapping/UnifiedChangeHistory.tsx

'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

type UnifiedChangeEntry = {
  summary: any;
  created_at: string;
  scraped_resources?: {
    id: string;
    name: string;
    url: string;
  } | null;
};

async function fetchUnifiedHistory(): Promise<UnifiedChangeEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resource_change_history')
    .select(
      `
        created_at,
        summary,
        scraped_resources!resource_change_history_resource_id_fkey ( id, name, url )
    `
    )
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching unified history:', error);
    throw new Error('No se pudo cargar el historial de cambios.');
  }
  return data;
}

interface UnifiedChangeHistoryProps {
  showLink?: boolean;
  length?: number;
}

export function UnifiedChangeHistory({ showLink = false, length = 2 }: UnifiedChangeHistoryProps) {
  const {
    data: history = [],
    isLoading,
    isError,
    error,
  } = useQuery<UnifiedChangeEntry[], Error>({
    queryKey: ['unified-url-history'],
    queryFn: fetchUnifiedHistory,
    staleTime: 1000 * 60 * 1,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full h-fit">
        <CardHeader>
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[140px] w-full" />
          <Separator />
          <Skeleton className="h-[140px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-5 w-1/2" />
        </CardFooter>
      </Card>
    );
  }
  if (isError) {
    return <p className="text-destructive">{error?.message}</p>;
  }
  if (history.length === 0) {
    return <p className="text-muted-foreground">No hay cambios registrados todavía.</p>;
  }
  return (
    <div className="flex flex-col">
      {showLink && (
        <Link
          href={'/dashboard/urls-change-history'}
          className="ms-auto text-sm text-primary hover:underline"
        >
          Ver todos los cambios
        </Link>
      )}

      <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-8">
        {history.slice(0, length).map((entry, index) => {
          if (entry.summary.length > 0) {
            return (
              <li
                key={`${entry.scraped_resources?.id}-${entry.created_at}-${index}`}
                className="ms-4"
              >
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                  {formatDate(entry.created_at)}
                </time>
                <h3 className="text-lg font-semibold text-foreground mt-1">
                  {entry.scraped_resources?.name}
                </h3>
                <Link
                  href={entry.scraped_resources?.url || '/'}
                  className="text-sm text-primary hover:underline flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acceder <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
                <div className="p-3 mt-2 bg-secondary/50 rounded-lg border">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {entry.summary.map((change: string, changeIndex: number) => (
                      <li key={changeIndex} className="text-muted-foreground">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }
          return null;
        })}
      </ol>
    </div>
  );
}
