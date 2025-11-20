'use client';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, Legend } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type ChartData = {
  date: string;
  correct: number;
  incorrect: number;
  blank: number;
};

const chartConfig = {
  correct: {
    label: 'Correctas',
    color: 'hsl(var(--chart-green))',
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

type ActiveChartKey = keyof typeof chartConfig;

async function fetchTestHistoryDataRpc(limit_count = 15) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_test_history_summary', {
    limit_count,
  });

  if (error) throw new Error('Error fetching test history data via RPC: ' + error.message);
  return data || [];
}

export function TestHistoryChart() {
  const [activeChart, setActiveChart] = useState<ActiveChartKey | null>(null);

  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['test-history-summary-rpc'],
    queryFn: () => fetchTestHistoryDataRpc(15),
    staleTime: 1000 * 60 * 5,
  });

  const sanitizedData: ChartData[] = useMemo(() => {
    if (!chartData) return [];
    return chartData.map((item) => ({
      date: item.created_at,
      correct: item.correct_answers ?? 0,
      incorrect: item.incorrect_answers ?? 0,
      blank: item.unanswered_questions ?? 0,
    }));
  }, [chartData]);

  const averages = useMemo(() => {
    if (sanitizedData.length === 0) {
      return { correct: 0, incorrect: 0, blank: 0 };
    }
    const sums = sanitizedData.reduce(
      (acc, curr) => {
        acc.correct += curr.correct;
        acc.incorrect += curr.incorrect;
        acc.blank += curr.blank;
        return acc;
      },
      { correct: 0, incorrect: 0, blank: 0 }
    );
    const totalTests = sanitizedData.length;
    return {
      correct: sums.correct / totalTests,
      incorrect: sums.incorrect / totalTests,
      blank: sums.blank / totalTests,
    };
  }, [sanitizedData]);

  if (isLoading) {
    return (
      <Card className="w-full h-fit mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !chartData) {
    return (
      <Card className="w-full h-fit mb-4">
        <CardHeader>
          <CardDescription>Error al cargar los últimos tests.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
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
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
          <p className="mt-2 text-sm text-muted-foreground">Aún no has completado ningún test.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-fit mb-4 py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Histórico de tests</CardTitle>
          <CardDescription>
            Mostrando el rendimiento de tus últimos {sanitizedData.length} tests
          </CardDescription>
        </div>
        <div className="flex">
          {(['correct', 'incorrect', 'blank'] as ActiveChartKey[]).map((key) => {
            const chart = key as ActiveChartKey;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => {
                  if (activeChart === chart) {
                    setActiveChart(null);
                  } else {
                    setActiveChart(chart);
                  }
                }}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label} (Promedio)
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {averages[key].toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={sanitizedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[100px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            {activeChart === null && <Legend verticalAlign="top" height={36} />}
            {(activeChart === null || activeChart === 'correct') && (
              <Line
                dataKey="correct"
                type="monotone"
                stroke={chartConfig.correct.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={chartConfig.correct.label}
              />
            )}
            {(activeChart === null || activeChart === 'incorrect') && (
              <Line
                dataKey="incorrect"
                type="monotone"
                stroke={chartConfig.incorrect.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={chartConfig.incorrect.label}
              />
            )}
            {(activeChart === null || activeChart === 'blank') && (
              <Line
                dataKey="blank"
                type="monotone"
                stroke={chartConfig.blank.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={chartConfig.blank.label}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
