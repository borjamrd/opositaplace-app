'use client';

import { Activity } from 'lucide-react';
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
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

// --- Lógica de Fetching (sin cambios, pero ahora recibirá `total_minutes`) ---
async function fetchStudyData() {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_daily_study_summary', {
        days_limit: 30,
    });
    if (error) throw new Error('Error al cargar los datos de estudio: ' + error.message);
    return data;
}

// --- Función de ayuda para formatear minutos ---
function formatMinutesToHoursAndMinutes(minutes: number): string {
    if (minutes === 0) return '0';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hDisplay = h > 0 ? `${h}` : '';
    const mDisplay = m > 0 ? `${m}` : '';
    return `${hDisplay} ${mDisplay}`.trim();
}

// --- Componente Principal ---
export function StudySessionsChart() {
    const {
        data: chartData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['study-sessions-summary'],
        queryFn: fetchStudyData,
        staleTime: 10000,
    });

    const totalMinutes = useMemo(() => {
        if (!chartData) return 0;
        return chartData.reduce((sum, item) => sum + item.total_minutes, 0);
    }, [chartData]);

    const chartConfig = {
        minutes: {
            label: 'Minutos',
            color: 'var(--chart-1)',
            icon: Activity,
        },
    } satisfies ChartConfig;

    if (isLoading) {
        /* ... estado de carga sin cambios ... */
    }
    if (isError) {
        /* ... estado de error sin cambios ... */
    }

    return (
        <Card className='w-full h-fit'>
            <CardHeader>
                {/* <CardTitle>Actividad de Estudio</CardTitle> */}
                <CardDescription>
                    Resumen de tiempo de estudio en los últimos 30 días.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[140px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData || []}
                        margin={{ left: 0, right: 12 }}
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
                            // El eje muestra horas, pero se calcula a partir de minutos
                            tickFormatter={(value) => `${Math.round(value / 60)}h`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value, name, item) =>
                                        formatMinutesToHoursAndMinutes(item.payload.total_minutes)
                                    }
                                />
                            }
                        />
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>

                        <Area
                            // El dataKey ahora apunta a total_minutes
                            dataKey="total_minutes"
                            name="Minutos"
                            type="natural"
                            fill="url(#fillDesktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {/* Mostramos el total con el formato mejorado */}
                            Total de {formatMinutesToHoursAndMinutes(totalMinutes)} {Math.floor(totalMinutes / 60) !== 1 ? 'minutos' : 'hora'} estudiados en
                            este periodo
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
