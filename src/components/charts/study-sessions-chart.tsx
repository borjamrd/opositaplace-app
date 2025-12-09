'use client';

import * as React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Modificamos la función para aceptar el límite de días
async function fetchStudyData(daysLimit: number) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_daily_study_summary', {
    days_limit: daysLimit,
  });
  if (error) throw new Error('Error fetching study data: ' + error.message);
  return data;
}

function formatMinutesToHoursAndMinutes(minutes: number): string {
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hDisplay = h > 0 ? `${h} hora${h === 1 ? '' : 's'}` : '';
  const mDisplay = m > 0 ? `${m} minuto${m === 1 ? '' : 's'}` : '';
  return `${hDisplay} ${mDisplay}`.trim();
}

export function StudySessionsChart() {
  // Estado para el selector de tiempo. Por defecto '30d'.
  const [timeRange, setTimeRange] = useState('7d');

  // Mapeo de las opciones a días numéricos para la RPC
  const timeRangeDays: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    all: 365, // Asumimos 1 año para "Todo el tiempo" o un número muy alto
  };

  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    // Añadimos timeRange a la queryKey para refetching automático
    queryKey: ['study-sessions-summary', timeRange],
    queryFn: () => fetchStudyData(timeRangeDays[timeRange]),
    staleTime: 1000 * 60 * 5,
  });

  const totalMinutes = useMemo(() => {
    if (!chartData) return 0;
    return chartData.reduce((sum, item) => sum + item.total_minutes, 0);
  }, [chartData]);

  const chartConfig = {
    minutes: {
      label: 'Minutos',
      color: 'hsl(var(--chart-1))',
      icon: Activity,
    },
  } satisfies ChartConfig;

  // Etiquetas dinámicas para la descripción
  const rangeLabels: Record<string, string> = {
    '7d': 'los últimos 7 días',
    '30d': 'los últimos 30 días',
    all: 'todo el tiempo',
  };

  if (isError) {
    return (
      <Card className="w-full h-fit">
        <CardHeader>
          <CardTitle>Actividad de estudio</CardTitle>
          <CardDescription>No se pudieron cargar los datos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[140px]">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-fit">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Actividad de estudio</CardTitle>
          <CardDescription>Resumen de {rangeLabels[timeRange]}.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 rounded-lg sm:ml-auto" aria-label="Seleccionar rango">
            <SelectValue placeholder="Último mes" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Último mes
            </SelectItem>
            <SelectItem value="all" className="rounded-lg">
              Todo el tiempo
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[140px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[140px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData || []}
              margin={{ left: 0, right: 12, top: 4 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="study_date"
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
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${Math.round(value / 60)}h`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => formatMinutesToHoursAndMinutes(Number(value))}
                  />
                }
              />
              <defs>
                <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-minutes)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-minutes)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="total_minutes"
                name="Minutos"
                type="monotone"
                fill="url(#fillMinutes)"
                fillOpacity={0.4}
                stroke="var(--color-minutes)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {!isLoading && (
                <>
                  Total de {formatMinutesToHoursAndMinutes(totalMinutes)} estudiadas en este periodo
                </>
              )}
              {isLoading && <Skeleton className="h-4 w-48" />}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
