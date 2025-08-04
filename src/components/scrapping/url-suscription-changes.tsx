'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { UrlScrapping } from './url-scrapping';

type ChangeHistoryEntry = {
    summary: string[];
    created_at: string;
};

async function fetchUrlHistory(urlId: string): Promise<ChangeHistoryEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_url_history_by_id', {
        target_url_id: urlId,
    });
    if (error) throw new Error('No se pudo cargar el historial de cambios.');
    return (data || []).map((entry: { summary: unknown; created_at: string }) => ({
        summary: Array.isArray(entry.summary)
            ? entry.summary.filter((item): item is string => typeof item === 'string')
            : [],
        created_at: entry.created_at,
    }));
}

export function UrlSubscriptionChanges({ urlId }: { urlId: string }) {
    const {
        data: history = [],
        isLoading,
        isError,
        error,
    } = useQuery<ChangeHistoryEntry[], Error>({
        queryKey: ['url-history', urlId],
        queryFn: () => fetchUrlHistory(urlId),
        enabled: !!urlId,
        staleTime: 1000 * 60 * 5, 
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

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-muted-foreground">Cargando historial...</p>;
        }
        if (isError) {
            return <p className="text-destructive">{error?.message}</p>;
        }
        if (history.length === 0) {
            return (
                <p className="text-muted-foreground">
                    No hay cambios registrados para esta URL todavía.
                </p>
            );
        }
        return (
            <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-6">
                {history.map((entry, index) => {
                    if (entry.summary.length > 0) {
                        return (
                            <li key={index} className="ms-4">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                    {formatDate(entry.created_at)}
                                </time>
                                <div className="p-3 mt-2 bg-secondary/50 rounded-lg border">
                                    <div>
                                        <h3 className="text-md font-semibold text-primary">
                                            Cambios Detectados
                                        </h3>
                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                            {entry.summary.map((change, changeIndex) => (
                                                <li
                                                    key={changeIndex}
                                                    className="text-muted-foreground"
                                                >
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        );
                    }
                })}
            </ol>
        );
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardDescription>
                    Últimos 5 cambios detectados para tus URLs suscritas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UrlScrapping />
                {renderContent()}
            </CardContent>
        </Card>
    );
}
