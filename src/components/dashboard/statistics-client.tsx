'use client';

import { useEffect, useState } from 'react';
import { useStudySessionStore } from '@/store/study-session-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getTestStatistics,
  getStudyTimeStatistics,
  getCoveredContentStatistics,
} from '@/actions/statistics';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TestStats {
  count: number;
  avgScore: number;
  totalQuestions: number;
}

interface StudyTimeStats {
  totalMinutes: number;
  sessionCount: number;
}

interface ContentStats {
  topics: Set<string>;
  blocks: Set<string>;
}

export function StatisticsClient() {
  const { studyCycles, activeStudyCycle, isLoadingCycles, activeOpposition } =
    useStudySessionStore();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [studyTimeStats, setStudyTimeStats] = useState<StudyTimeStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    if (activeStudyCycle?.id && !selectedCycleId) {
      setSelectedCycleId(activeStudyCycle.id);
    }
  }, [activeStudyCycle, selectedCycleId]);

  useEffect(() => {
    if (!selectedCycleId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Tests
        const { attempts } = await getTestStatistics(selectedCycleId);
        if (attempts) {
          const count = attempts.length;
          const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
          const totalQuestions = attempts.reduce(
            (acc, curr) => acc + (curr.total_questions || 0),
            0
          );
          setTestStats({
            count,
            avgScore: count > 0 ? totalScore / count : 0,
            totalQuestions,
          });
        }

        // Fetch Study Time
        const { sessions } = await getStudyTimeStatistics(selectedCycleId);
        if (sessions) {
          // duration_seconds comes from the DB
          const totalMinutes = sessions.reduce(
            (acc: number, curr: any) => acc + (curr.duration_seconds || 0) / 60,
            0
          );
          setStudyTimeStats({
            totalMinutes,
            sessionCount: sessions.length,
          });
        }

        // Fetch Content
        const { questions } = await getCoveredContentStatistics(selectedCycleId);
        if (questions) {
          const topics = new Set<string>();
          const blocks = new Set<string>();

          questions.forEach((q: any) => {
            if (q.question?.topic?.name) topics.add(q.question.topic.name);
            if (q.question?.topic?.block?.name) blocks.add(q.question.topic.block.name);
          });

          setContentStats({ topics, blocks });
        }
      } catch (error) {
        console.error('Failed to load statistics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCycleId]);

  if (isLoadingCycles) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!studyCycles.length) {
    return <div className="p-4">No hay ciclos de estudio disponibles.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas</h2>
        <div className="w-[200px]">
          <Select value={selectedCycleId || ''} onValueChange={setSelectedCycleId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un ciclo" />
            </SelectTrigger>
            <SelectContent>
              {studyCycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  Vuelta {cycle.cycle_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Tests Realizados */}
          <Card>
            <CardHeader>
              <CardTitle>Tests Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testStats?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Nota media: {testStats?.avgScore.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">
                Preguntas totales: {testStats?.totalQuestions || 0}
              </p>
            </CardContent>
          </Card>

          {/* Tiempo de Estudio */}
          <Card>
            <CardHeader>
              <CardTitle>Tiempo de Estudio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studyTimeStats ? Math.round(studyTimeStats.totalMinutes / 60) : 0} h
              </div>
              <p className="text-xs text-muted-foreground">
                {studyTimeStats?.totalMinutes || 0} minutos totales
              </p>
              <p className="text-xs text-muted-foreground">
                {studyTimeStats?.sessionCount || 0} sesiones
              </p>
            </CardContent>
          </Card>

          {/* Bloques y Temas */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Temario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentStats?.topics.size || 0}</div>
              <p className="text-xs text-muted-foreground">Temas tocados</p>
              <div className="mt-2 text-2xl font-bold">{contentStats?.blocks.size || 0}</div>
              <p className="text-xs text-muted-foreground">Bloques tocados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tables could go here later */}
    </div>
  );
}
