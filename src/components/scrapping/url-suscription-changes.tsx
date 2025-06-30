'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { UrlScrapping } from './url-scrapping';

// 1. TIPO DE DATO AJUSTADO
// 'summary' es ahora directamente un array de strings.
type ChangeHistoryEntry = {
    summary: string[];
    created_at: string;
};

// --- Componente Principal ---
export function UrlSubscriptionChanges({ urlId }: { urlId: string }) {
    const supabase = createClient();
    const [history, setHistory] = useState<ChangeHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!urlId) {
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase.rpc('get_url_history_by_id', {
                target_url_id: urlId,
            });

            if (error) {
                console.error('Error fetching change history:', error);
                setError('No se pudo cargar el historial de cambios.');
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [supabase, urlId]);

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
        if (loading) {
            return <p className="text-muted-foreground">Cargando historial...</p>;
        }
        if (error) {
            return <p className="text-destructive">{error}</p>;
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
                                    {entry.summary && entry.summary.length > 0 ? (
                                        <div>
                                            <h3 className="text-md font-semibold text-primary">
                                                Cambios Detectados
                                            </h3>
                                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                                {/* Iteramos directamente sobre entry.summary */}
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
                                    ) : (
                                        // 3. MENSAJE ESPECIAL PARA "NO CAMBIOS"
                                        <p className="text-sm text-muted-foreground italic">
                                            Comprobación realizada. No se detectaron cambios
                                            significativos.
                                        </p>
                                    )}
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
                <CardTitle>Historial de Cambios Recientes</CardTitle>
                <CardDescription>
                    Últimos 5 cambios detectados para el recurso seleccionado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UrlScrapping />
                {renderContent()}
            </CardContent>
        </Card>
    );
}
