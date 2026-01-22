'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useStudySessionStore } from '@/store/study-session-store';
import { AlertCircle, BarChart3, Loader2, PieChart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Opposition {
  id: string;
  name: string;
  is_assigned: boolean;
}

interface OppositionInfoClientProps {
  userOppositions: Opposition[];
}

interface TopConceptGlobal {
  concept: string;
  frequency: number;
}

interface ConceptStatsByExam {
  concept: string;
  exam_name: string;
  frequency: number;
}

interface ConceptByTopic {
  block_name: string;
  concept: string;
  frequency: number;
  topic_name: string;
}

export function OppositionInfoClient() {
  const { activeOpposition } = useStudySessionStore();

  const [topConcepts, setTopConcepts] = useState<TopConceptGlobal[]>([]);
  const [conceptStats, setConceptStats] = useState<ConceptStatsByExam[]>([]);
  const [conceptsByTopic, setConceptsByTopic] = useState<ConceptByTopic[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!activeOpposition) return;

    setLoading(true);
    setError(null);

    try {
      const [
        { data: topConceptsData, error: topConceptsError },
        { data: conceptStatsData, error: conceptStatsError },
        { data: conceptsByTopicData, error: conceptsByTopicError },
      ] = await Promise.all([
        supabase.rpc('get_top_concepts_global', {
          p_opposition_id: activeOpposition.id,
          p_limit: 10,
        }),
        supabase.rpc('get_concept_stats_by_exam', { p_opposition_id: activeOpposition.id }),
        supabase.rpc('get_concepts_by_topic', {
          p_opposition_id: activeOpposition.id,
          p_limit: 10,
        }),
      ]);

      if (topConceptsError) throw topConceptsError;
      if (conceptStatsError) throw conceptStatsError;
      if (conceptsByTopicError) throw conceptsByTopicError;

      setTopConcepts(topConceptsData || []);
      setConceptStats(conceptStatsData || []);
      setConceptsByTopic(conceptsByTopicData || []);
    } catch (err: any) {
      console.error('Error fetching opposition info:', err);
      setError('Error al cargar la información de la oposición. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [activeOpposition, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6 container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Información de la Oposición</h2>
          <p className="text-muted-foreground">
            Estadísticas detalladas sobre conceptos y exámenes.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Top Concepts Card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Conceptos Globales
              </CardTitle>
              <CardDescription>Conceptos más frecuentes en todos los exámenes.</CardDescription>
            </CardHeader>
            <CardContent>
              {topConcepts.length > 0 ? (
                <div className="space-y-4">
                  {topConcepts.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div className="font-medium truncate max-w-[70%]" title={item.concept}>
                        {index + 1}. {item.concept}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                          {item.frequency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Concept Stats By Exam - Simplified View (since list can be long) */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas por Examen (Top 10)
              </CardTitle>
              <CardDescription>Conceptos destacados por examen reciente.</CardDescription>
            </CardHeader>
            <CardContent>
              {conceptStats.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    conceptStats.reduce(
                      (acc, item) => {
                        if (!acc[item.exam_name]) acc[item.exam_name] = [];
                        acc[item.exam_name].push(item);
                        return acc;
                      },
                      {} as Record<string, typeof conceptStats>
                    )
                  )
                    .slice(0, 5)
                    .map(([examName, items], idx) => (
                      <div key={idx} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                        <div
                          className="font-semibold text-sm text-primary truncate"
                          title={examName}
                        >
                          {examName}
                        </div>
                        <div className="flex flex-col space-y-1">
                          {items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm truncate"
                            >
                              <span title={item.concept}>{item.concept}</span>
                              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {item.frequency} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Concepts by Topic Summary */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Conceptos por Tema
              </CardTitle>
              <CardDescription>
                Distribución de frecuencia de conceptos agrupados por tema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conceptsByTopic.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(
                    conceptsByTopic.reduce(
                      (acc, item) => {
                        if (!acc[item.topic_name]) acc[item.topic_name] = [];
                        acc[item.topic_name].push(item);
                        return acc;
                      },
                      {} as Record<string, typeof conceptsByTopic>
                    )
                  ).map(([topicName, items], index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col"
                    >
                      <div
                        className="font-semibold text-sm mb-1 text-primary truncate"
                        title={topicName}
                      >
                        {topicName}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3 border-b pb-1">
                        {items[0].block_name}
                      </div>
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="truncate pr-2" title={item.concept}>
                              {item.concept}
                            </span>
                            <span className="font-bold bg-secondary px-2 py-0.5 rounded text-xs">
                              {item.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
