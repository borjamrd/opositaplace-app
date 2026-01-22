'use client';

import { ArrowUpRight, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { createClient } from '@/lib/supabase/client';
import { useStudySessionStore } from '@/store/study-session-store';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface TopConceptGlobal {
  concept: string;
  frequency: number;
}

interface OppositionInfoWidgetProps {
  href?: string;
}

export function OppositionInfoWidget({ href }: OppositionInfoWidgetProps) {
  const { activeOpposition } = useStudySessionStore();
  const [topConcepts, setTopConcepts] = useState<TopConceptGlobal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchTopConcepts = async () => {
      if (!activeOpposition) return;

      setLoading(true);
      setError(false);

      try {
        const { data, error } = await supabase.rpc('get_top_concepts_global', {
          p_opposition_id: activeOpposition.id,
          p_limit: 5,
        });

        if (error) throw error;
        setTopConcepts(data || []);
      } catch (err) {
        console.error('Error fetching top concepts for widget:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopConcepts();
  }, [activeOpposition, supabase]);

  if (!activeOpposition) return null;

  return (
    <Card className="h-full flex flex-col relative w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Normativa más preguntada</CardTitle>
          </div>
          <CardDescription>Conceptos más repetidos en los tests de tu oposición</CardDescription>
        </div>
        {href && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full border border-primary text-primary hover:bg-primary/20 hover:text-primary"
            asChild
          >
            <Link href={href}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow pt-2">
        {loading ? (
          <div className="flex h-[150px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex h-[150px] items-center justify-center text-muted-foreground text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error al cargar
          </div>
        ) : topConcepts.length > 0 ? (
          <div className="space-y-3">
            {topConcepts.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="truncate max-w-[75%] font-medium" title={item.concept}>
                  {index + 1}. {item.concept}
                </span>
                <Badge variant="secondary" className="px-1.5 h-5 text-[10px]">
                  x{item.frequency}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[150px] items-center justify-center text-muted-foreground text-center text-sm p-4">
            No hay datos suficientes aún.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
