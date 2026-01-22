'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, AlertCircle, Layers, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStudySessionStore } from '@/store/study-session-store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PageContainer } from '@/components/page-container';

// --- Interfaces ---

interface Opposition {
  id: string;
  name: string;
  is_assigned: boolean;
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

// Estructura para el agrupamiento
type GroupedConcepts = {
  [blockName: string]: {
    [topicName: string]: ConceptByTopic[];
  };
};

// --- Componente Principal ---

export function OppositionInfoClient() {
  const { activeOpposition } = useStudySessionStore();

  const [topConcepts, setTopConcepts] = useState<TopConceptGlobal[]>([]);
  const [conceptStats, setConceptStats] = useState<ConceptStatsByExam[]>([]);
  const [conceptsByTopic, setConceptsByTopic] = useState<ConceptByTopic[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 1. Fetch de datos
  const fetchData = useCallback(async () => {
    if (!activeOpposition) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Cargando estadísticas para:', activeOpposition.name);

      const [
        { data: topConceptsData, error: topConceptsError },
        { data: conceptStatsData, error: conceptStatsError },
        { data: conceptsByTopicData, error: conceptsByTopicError },
      ] = await Promise.all([
        // Top Global
        supabase.rpc('get_top_concepts_global', {
          p_opposition_id: activeOpposition.id,
          p_limit: 10,
        }),
        // Por Examen
        supabase.rpc('get_concept_stats_by_exam', {
          p_opposition_id: activeOpposition.id,
        }),
        // Por Tema (Pedimos 1000 para poder construir la jerarquía completa en el cliente)
        supabase.rpc('get_concepts_by_topic', {
          p_opposition_id: activeOpposition.id,
          p_limit: 1000,
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
      setError(
        'Error al cargar la información. Asegúrate de haber actualizado las funciones SQL con SECURITY DEFINER.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeOpposition, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Lógica de Agrupamiento (Memoized)
  // Transforma la lista plana en: Bloque -> Temas -> Conceptos
  const groupedData = useMemo(() => {
    const groups: GroupedConcepts = {};

    conceptsByTopic.forEach((item) => {
      // Inicializar Bloque
      if (!groups[item.block_name]) {
        groups[item.block_name] = {};
      }
      // Inicializar Tema
      if (!groups[item.block_name][item.topic_name]) {
        groups[item.block_name][item.topic_name] = [];
      }
      // Añadir Concepto
      groups[item.block_name][item.topic_name].push(item);
    });

    return groups;
  }, [conceptsByTopic]);

  if (!activeOpposition) {
    return (
      <Alert className="max-w-4xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Selecciona una Oposición</AlertTitle>
        <AlertDescription>
          Por favor, selecciona una oposición en el menú lateral para ver sus estadísticas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <PageContainer
      title="Analítica de contenidos"
      description=" Descubre qué conceptos son los más preguntados y dónde poner el foco."
    >
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8">
          {/* SECCIÓN 1: RESUMEN GLOBAL (TOP CARDS) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Conceptos Globales */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Conceptos más preguntados (Global)
                </CardTitle>
                <CardDescription>Lo que sí o sí ha caído en tu oposición</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {topConcepts.length > 0 ? (
                    <div className="space-y-4">
                      {topConcepts.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{item.concept}</span>
                          </div>
                          <Badge variant="secondary">{item.frequency} preguntas</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      Sin datos suficientes
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Estadísticas por Examen */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Top conceptos por examen reciente
                </CardTitle>
                <CardDescription>¿Qué preguntaron en la última convocatoria?</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {conceptStats.length > 0 ? (
                    <div className="space-y-4">
                      {conceptStats.slice(0, 15).map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-1 border-b pb-2 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {item.exam_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.frequency} reps
                            </Badge>
                          </div>
                          <span className="text-sm font-medium pl-2 border-l-2 border-primary/20">
                            {item.concept}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      Sin datos suficientes
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* SECCIÓN 2: DESGLOSE POR BLOQUE Y TEMA */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold">Desglose por bloques y temas</h3>
            </div>

            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([blockName, topics]) => (
                <div key={blockName} className="space-y-4 animate-in fade-in duration-500">
                  {/* Título del Bloque */}
                  <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                    <BookOpen className="h-5 w-5 text-foreground" />
                    <h4 className="font-bold text-lg">{blockName}</h4>
                  </div>

                  {/* Grid de Temas del Bloque */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(topics).map(([topicName, concepts]) => (
                      <Card
                        key={topicName}
                        className="flex flex-col h-full hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3 bg-secondary/10">
                          <CardTitle
                            className="text-base font-semibold leading-tight line-clamp-2"
                            title={topicName}
                          >
                            {topicName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {concepts.reduce((acc, c) => acc + c.frequency, 0)} preguntas totales
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 flex-1">
                          <ul className="space-y-2">
                            {concepts.slice(0, 5).map((c, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-start text-sm gap-2"
                              >
                                <span className="text-muted-foreground truncate" title={c.concept}>
                                  {c.concept}
                                </span>
                                <span className="font-bold text-primary text-xs whitespace-nowrap">
                                  x{c.frequency}
                                </span>
                              </li>
                            ))}
                            {concepts.length > 5 && (
                              <li className="text-xs text-center text-muted-foreground pt-2 italic">
                                +{concepts.length - 5} conceptos más...
                              </li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">
                  No hay datos de distribución por temas disponibles.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
