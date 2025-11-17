import { getRoadmapData } from '@/actions/roadmap';
import { RoadmapFlow } from '@/components/roadmap/roadmap-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Block, StudyCycle, SyllabusStatus, Topic } from '@/lib/supabase/types';
import { Terminal } from 'lucide-react';

export default async function RoadmapPage() {
  type RoadmapDataType = {
    blocks: Block[];
    topics: Topic[];
    topicStatusMap: Record<string, SyllabusStatus>;
    activeCycle: StudyCycle;
  };

  let data: RoadmapDataType | null = null;
  let error: string | null = null;

  try {
    data = await getRoadmapData();
  } catch (e) {
    error = (e as Error).message;
  }
  if (error || !data) {
    return (
      <div className="container mx-auto mt-8 max-w-lg">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar el Roadmap</AlertTitle>
          <AlertDescription>
            {error || 'No se pudieron cargar los datos. Asegúrate de tener una oposición activa.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-(--spacing(20)))] w-full relative"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <RoadmapFlow
        initialBlocks={data.blocks}
        initialTopics={data.topics}
        initialStatusMap={data.topicStatusMap}
        initialCycle={data.activeCycle}
      />
    </div>
  );
}
