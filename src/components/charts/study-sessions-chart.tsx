'use client';

import { Activity, AlertCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useMemo } from 'react';

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
import { Skeleton } from '@/components/ui/skeleton';

async function fetchStudyData() {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_daily_study_summary', {
        days_limit: 30,
    });
    if (error) throw new Error('Error fetching study data: ' + error.message);
    return data;
}

function formatMinutesToHoursAndMinutes(minutes: number): string {
    if (minutes === 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hDisplay = h > 0 ? `${h}h` : '';
    const mDisplay = m > 0 ? `${m}m` : '';
    return `${hDisplay} ${mDisplay}`.trim();
}

export function StudySessionsChart() {
    const {
        data: chartData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['study-sessions-summary'],
        queryFn: fetchStudyData,
        staleTime: 1000 * 60 * 5, // 5 minutes
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

    if (isLoading) {
        return (
            <Card className="w-full h-fit">
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

    if (isError) {
        return (
            <Card className="w-full h-fit">
                <CardHeader>
                    <CardTitle>Actividad de Estudio</CardTitle>
                    <CardDescription>Resumen de los últimos 30 días.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[140px]">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="mt-2 text-sm text-destructive">
                        No se pudieron cargar los datos.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-fit">
            <CardHeader>
                <CardTitle>Actividad de Estudio</CardTitle>
                <CardDescription>
                    Resumen de tiempo de estudio en los últimos 30 días.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            tickFormatter={(value) =>
                                new Date(value).toLocaleDateString('es-ES', {
                                    month: 'short',
                                    day: 'numeric',
                                })
                            }
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
                                    formatter={(value) =>
                                        formatMinutesToHoursAndMinutes(Number(value))
                                    }
                                />
                            }
                        />
                        <defs>
                            <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-minutes)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-minutes)"
                                    stopOpacity={0.1}
                                />
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
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Total de {formatMinutesToHoursAndMinutes(totalMinutes)} estudiados en
                            este periodo
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
