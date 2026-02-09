'use client';

import { Block, StudyCycle, SyllabusStatus, Topic } from '@/lib/supabase/types';
import { ArrowUpRight, BookOpen, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface RoadmapDataType {
  blocks: Block[];
  topics: Topic[];
  topicStatusMap: Record<string, SyllabusStatus>;
  activeCycle: StudyCycle;
}

interface RoadmapStatusProps {
  data: RoadmapDataType | null;
  href: string;
}

export function RoadmapStatus({ data, href }: RoadmapStatusProps) {
  if (!data) {
    return null;
  }

  const { topics, blocks, topicStatusMap } = data;

  // 1. Temas en curso (status === 'in_progress')
  const inProgressTopics = topics.filter((topic) => topicStatusMap[topic.id] === 'in_progress');

  // 2. Siguiente tema
  // Primero ordenamos los temas por bloque (posición del bloque) y luego por su propia posición
  const blockPositionMap = blocks.reduce(
    (acc, block) => {
      acc[block.id] = block.position;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedTopics = [...topics].sort((a, b) => {
    const blockPosA = blockPositionMap[a.block_id || ''] ?? Number.MAX_SAFE_INTEGER;
    const blockPosB = blockPositionMap[b.block_id || ''] ?? Number.MAX_SAFE_INTEGER;

    if (blockPosA !== blockPosB) {
      return blockPosA - blockPosB;
    }
    return a.position - b.position;
  });

  const nextTopic = sortedTopics.find(
    (topic) => !topicStatusMap[topic.id] || topicStatusMap[topic.id] === 'not_started'
  );

  // 3. % completado de la oposicion
  const totalTopics = topics.length;
  const completedTopics = topics.filter((topic) => topicStatusMap[topic.id] === 'completed').length;

  const progressPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-bold">Estado del temario</CardTitle>
        </div>
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
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pt-2">
        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Progreso en la {data.activeCycle.cycle_number}ª vuelta</span>
            </div>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        {/* Temas en curso */}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Temas en curso</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {inProgressTopics.length > 0 ? (
              inProgressTopics.map((topic) => (
                <Badge key={topic.id} variant="secondary" className="text-xs">
                  {topic.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No hay temas en curso actualmente.
                <Link className="text-primary hover:underline flex items-center gap-2" href={href}>
                  <span>Comienza ahora</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Siguiente tema */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Siguiente tema a estudiar</span>
          </div>
          <div>
            {nextTopic ? (
              <p className="text-sm font-medium leading-none">{nextTopic.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                ¡Has completado todos los temas!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
