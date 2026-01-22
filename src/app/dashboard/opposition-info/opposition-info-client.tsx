'use client';

import { PageContainer } from '@/components/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { handleManageSubscription as manageSubscription } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/client';
import { useStudySessionStore } from '@/store/study-session-store';
import { AlertCircle, BarChart3, BookOpen, Layers, Loader2, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

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

interface OppositionInfoClientProps {
  isPremium?: boolean;
}

// Estructura para el agrupamiento
type GroupedConcepts = {
  [blockName: string]: {
    [topicName: string]: ConceptByTopic[];
  };
};

// --- Componente Principal ---

export function OppositionInfoClient({ isPremium = false }: OppositionInfoClientProps) {
  const { activeOpposition } = useStudySessionStore();
  const [isLoading, setIsLoading] = useState(false);

  const [topConcepts, setTopConcepts] = useState<TopConceptGlobal[]>([]);
  const [conceptStats, setConceptStats] = useState<ConceptStatsByExam[]>([]);
  const [conceptsByTopic, setConceptsByTopic] = useState<ConceptByTopic[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const { toast } = useToast();

  const handleManageSubscription = async () => {
    await manageSubscription(setIsLoading, toast);
  };

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
        isPremium
          ? supabase.rpc('get_concept_stats_by_exam', {
              p_opposition_id: activeOpposition.id,
            })
          : Promise.resolve({
              data: [
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
                {
                  concept: 'Buen intento, deja de debuggear',
                  exam_name: 'Plan Avanzado',
                  frequency: 0,
                },
              ],
              error: null,
            }),
        // Por Tema (Pedimos 1000 para poder construir la jerarquía completa en el cliente)
        isPremium
          ? supabase.rpc('get_concepts_by_topic', {
              p_opposition_id: activeOpposition.id,
              p_limit: 1000,
            })
          : Promise.resolve({
              data: [
                {
                  block_name: 'Bloque 1',
                  topic_name: 'Tema 1',
                  concept: 'Concepto 1',
                  frequency: 1,
                },
                {
                  block_name: 'Bloque 1',
                  topic_name: 'Tema 1',
                  concept: 'Concepto 2',
                  frequency: 2,
                },
                {
                  block_name: 'Bloque 1',
                  topic_name: 'Tema 2',
                  concept: 'Concepto 3',
                  frequency: 3,
                },
                {
                  block_name: 'Bloque 2',
                  topic_name: 'Tema 4',
                  concept: 'Concepto 4',
                  frequency: 4,
                },
                {
                  block_name: 'Bloque 2',
                  topic_name: 'Tema 5',
                  concept: 'Concepto 5',
                  frequency: 5,
                },
                {
                  block_name: 'Bloque 3',
                  topic_name: 'Tema 6',
                  concept: 'Concepto 6',
                  frequency: 6,
                },
                {
                  block_name: 'Bloque 3',
                  topic_name: 'Tema 7',
                  concept: 'Concepto 7',
                  frequency: 7,
                },
                {
                  block_name: 'Bloque 4',
                  topic_name: 'Tema 8',
                  concept: 'Concepto 8',
                  frequency: 8,
                },
                {
                  block_name: 'Bloque 4',
                  topic_name: 'Tema 9',
                  concept: 'Concepto 9',
                  frequency: 9,
                },
                {
                  block_name: 'Bloque 5',
                  topic_name: 'Tema 10',
                  concept: 'Concepto 10',
                  frequency: 10,
                },
              ],
              error: null,
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

            {/* Estadísticas por Examen (PREMIUM LOCKED) */}
            <div className="relative h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Top conceptos por examen reciente
                  </CardTitle>
                  <CardDescription>¿Qué preguntaron en la última convocatoria?</CardDescription>
                </CardHeader>
                <CardContent className={!isPremium ? 'blur-sm select-none' : ''}>
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

              {/* OVERLAY PARA CONTENIDO BLOQUEADO */}
              {!isPremium && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg border-2 border-primary/20 p-6 text-center z-10">
                  <Lock className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Conceptos por examen</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Actualiza tu plan para ver el desglose por examen y descubrir patrones de
                    preguntas.
                  </p>
                  <Button
                    size="lg"
                    className="font-semibold shadow-lg"
                    onClick={handleManageSubscription}
                  >
                    Desbloquear
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* SECCIÓN 2: DESGLOSE POR BLOQUE Y TEMA (PREMIUM LOCKED) */}
          <div className="space-y-6 relative">
            {!isPremium && (
              <div className="absolute inset-0 flex flex-col items-center pt-32 bg-background/60 backdrop-blur-[2px] z-10">
                <Lock className="h-16 w-16 text-primary mb-6" />
                <h3 className="text-3xl font-bold mb-4">Análisis detallado por tema</h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md text-center">
                  Descubre qué temas se repiten más y optimiza tu tiempo de estudio con el plan
                  Premium.
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 font-bold shadow-xl"
                  onClick={handleManageSubscription}
                >
                  Desbloquear
                </Button>
              </div>
            )}

            <div className={!isPremium ? 'blur-md select-none pointer-events-none' : ''}>
              <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Desglose por bloques y temas</h3>
              </div>

              {Object.keys(groupedData).length > 0 ? (
                Object.entries(groupedData).map(([blockName, topics]) => (
                  <div key={blockName} className="space-y-4 animate-in fade-in duration-500 mt-6">
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
                                  <span
                                    className="text-muted-foreground truncate"
                                    title={c.concept}
                                  >
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
                <div className="text-center py-12 border rounded-lg bg-muted/20 mt-4">
                  <p className="text-muted-foreground">
                    No hay datos de distribución por temas disponibles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
