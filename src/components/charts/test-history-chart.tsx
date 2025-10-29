// src/components/charts/test-history-chart.tsx
'use client';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'; 

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type TestAttemptSummary = {
  id: string;
  created_at: string;
  correct_answers: number | null;
  incorrect_answers: number | null;
  unanswered_questions: number | null;
};

async function fetchTestHistoryDataRpc(limit_count = 15): Promise<TestAttemptSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_test_history_summary', {
    limit_count,
  });

  if (error) throw new Error('Error fetching test history data via RPC: ' + error.message);
  return data || [];
}

export function TestHistoryChart() {
  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['test-history-summary-rpc'], 
    queryFn: () => fetchTestHistoryDataRpc(15),
    staleTime: 1000 * 60 * 5,
  });

  const averageCounts = useMemo(() => {
    if (!chartData || chartData.length === 0) return { correct: 0, incorrect: 0, blank: 0 };
    const total = chartData.length;
    const sums = chartData.reduce(
      (acc, item) => {
        acc.correct += item.correct_answers ?? 0;
        acc.incorrect += item.incorrect_answers ?? 0;
        acc.blank += item.unanswered_questions ?? 0;
        return acc;
      },
      { correct: 0, incorrect: 0, blank: 0 }
    );
    return {
      correct: sums.correct / total,
      incorrect: sums.incorrect / total,
      blank: sums.blank / total,
    };
  }, [chartData]);

  // 4. Configuración del gráfico para tests
  const chartConfig = {
    correct: {
      label: 'Correctas',
      color: 'hsl(var(--chart-green))', // Usar variables CSS definidas
      icon: CheckCircle,
    },
    incorrect: {
      label: 'Incorrectas',
      color: 'hsl(var(--chart-red))',
      icon: XCircle,
    },
    blank: {
      label: 'En Blanco',
      color: 'hsl(var(--chart-gray))',
      icon: HelpCircle,
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className="w-full h-fit mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[140px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-5 w-1/2" />
        </CardFooter>
      </Card>
    );
  }

  if (isError || !chartData) {
    return (
      <Card className="w-full h-fit mb-4">
        <CardHeader>
          <CardDescription>Error al cargar los últimos tests.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[140px]">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">No se pudieron cargar los datos.</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full h-fit mb-4">
        <CardHeader>
          <CardDescription>Rendimiento en tus últimos tests completados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[140px]">
          <p className="mt-2 text-sm text-muted-foreground">Aún no has completado ningún test.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-fit mb-4">
      <CardHeader>
        <CardDescription>
          Rendimiento en tus últimos {chartData.length} tests completados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 5. Usar ChartContainer y BarChart */}
        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -20, right: 12, top: 4 }} // Ajustar margen izquierdo para YAxis
            barGap={4} // Espacio entre grupos de barras (si no son apiladas)
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="created_at"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // Ajusta el dominio si esperas muchos más de 100 preguntas
              domain={[0, 'dataMax + 10']}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  // Formatter para mostrar el número directamente
                  formatter={(value, name, item) => {
                    const key = typeof name === 'string' ? name.split('.')[0] : String(name);
                    const label =
                      (chartConfig as Record<string, { label: string }>)[key]?.label ?? key;
                    return `${label}: ${value}`;
                  }}
                />
              }
            />
            <Bar
              maxBarSize={40}
              dataKey="correct_answers"
              stackId="a"
              fill="hsl(var(--chart-green))"
              name="correct.label"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              maxBarSize={40}
              dataKey="incorrect_answers"
              stackId="a"
              fill="hsl(var(--chart-red))"
              name="incorrect.label"
            />
            <Bar
              maxBarSize={40}
              dataKey="unanswered_questions"
              stackId="a"
              fill="hsl(var(--chart-gray))"
              name="blank.label"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Promedio por test en este periodo:
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 fill-green-500 text-green-500" /> Correctas:{' '}
              {averageCounts.correct.toFixed(1)}
              <XCircle className="ml-2 h-3 w-3 fill-red-500 text-red-500" /> Incorrectas:{' '}
              {averageCounts.incorrect.toFixed(1)}
              <HelpCircle className="ml-2 h-3 w-3 fill-gray-400 text-gray-400" /> En Blanco:{' '}
              {averageCounts.blank.toFixed(1)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
