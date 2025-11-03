'use client';

import { useMemo, useState, useTransition } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import { updateTopicStatus } from '@/actions/roadmap';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Block, StudyCycle, SyllabusStatus, Topic } from '@/lib/supabase/types';
import { Check, Loader2 } from 'lucide-react';

type StatusMap = Record<string, SyllabusStatus>;

interface RoadmapFlowProps {
  initialBlocks: Block[];
  initialTopics: Topic[];
  initialStatusMap: StatusMap;
  initialCycle: StudyCycle;
}

// Función para asignar colores según el estado
const getStatusStyle = (status: SyllabusStatus | undefined) => {
  switch (status) {
    case 'completed':
      return {
        background: '#AD6A9B', // Tu color Primario
        color: 'white',
        border: '1px solid #AD6A9B',
      };
    case 'in_progress':
      return {
        background: '#14B4E7', // Tu color Accent
        color: 'white',
        border: '1px solid #14B4E7',
      };
    case 'not_started':
    default:
      return {
        background: '#FFFFFF',
        color: '#333333',
        border: '1px solid #E0E0E0',
      };
  }
};

export function RoadmapFlow({
  initialBlocks,
  initialTopics,
  initialStatusMap,
  initialCycle,
}: RoadmapFlowProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // --- Lógica de React Flow ---
  // Generamos los nodos y ejes iniciales
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yPosBlock = 0; // Posición Y para los bloques

    initialBlocks.forEach((block) => {
      // 1. Crear Nodo de Bloque (Contenedor)
      const blockNodeId = `block-${block.id}`;
      const topicsInBlock = initialTopics.filter((t) => t.block_id === block.id);

      // Calculamos altura del bloque
      const blockHeight = 80 + topicsInBlock.length * 60;

      nodes.push({
        id: blockNodeId,
        type: 'default',
        data: { label: `Bloque ${block.position}: ${block.name}` },
        position: { x: 50, y: yPosBlock },
        selectable: false,
        style: {
          width: 600,
          height: blockHeight,
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid #E0E0E0',
          fontSize: '1.1rem',
          fontWeight: 'bold',
        },
      });

      // 2. Crear Nodos de Tema (Hijos)
      let yPosTopic = 60; // Posición Y relativa dentro del bloque
      topicsInBlock.forEach((topic) => {
        const topicNodeId = `topic-${topic.id}`;
        const status = initialStatusMap[topic.id];

        nodes.push({
          id: topicNodeId,
          type: 'default',
          data: { label: `Tema ${topic.position}: ${topic.name}` },
          position: { x: 25, y: yPosTopic },
          parentNode: blockNodeId, // ¡Clave para anidarlo!
          extent: 'parent',
          style: {
            width: 550,
            ...getStatusStyle(status), // Aplicamos el estilo de estado
          },
        });
        yPosTopic += 60; // Siguiente tema 60px más abajo
      });

      yPosBlock += blockHeight + 40; // Siguiente bloque 40px más abajo
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [initialBlocks, initialTopics, initialStatusMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // --- Lógica de Interacción ---

  // Al hacer clic en un nodo de tema
  const handleNodeClick = (event: any, node: Node) => {
    if (node.id.startsWith('topic-')) {
      const topicId = node.id.replace('topic-', '');
      const topic = initialTopics.find((t) => t.id === topicId);
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  };

  // Al cambiar el estado desde el panel
  const handleStatusChange = (newStatus: SyllabusStatus) => {
    if (!selectedTopic) return;

    const topicId = selectedTopic.id;

    startTransition(async () => {
      // 1. Llamar a la Server Action
      const result = await updateTopicStatus(topicId, newStatus);

      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        return;
      }

      // 2. Actualizar el estado visual del nodo en React Flow
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === `topic-${topicId}`) {
            return {
              ...node,
              style: { ...node.style, ...getStatusStyle(newStatus) },
            };
          }
          return node;
        })
      );

      toast({
        title: '¡Actualizado!',
        description: `El tema "${selectedTopic.name}" se marcó como ${newStatus}.`,
      });

      // 3. Si se inició un nuevo ciclo, mostrar confetti y recargar
      if (result.newCycleStarted) {
        toast({
          title: '¡ENHORABUENA! 🥳',
          description: '¡Has completado una vuelta! Iniciando la Vuelta 2.',
          duration: 5000,
        });
        // Recargamos la página para ver el nuevo roadmap
        window.location.reload();
      }

      setSelectedTopic(null); // Cerrar el panel
    });
  };

  const currentStatus = selectedTopic
    ? initialStatusMap[selectedTopic.id] || 'not_started'
    : 'not_started';

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background />
      </ReactFlow>

      {/* Panel lateral para cambiar estado del Tema */}
      <Sheet open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        <SheetContent>
          {selectedTopic && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Tema {selectedTopic.position}: {selectedTopic.name}
                </SheetTitle>
                <SheetDescription>
                  Vuelta {initialCycle.cycle_number} · Bloque{' '}
                  {initialBlocks.find((b) => b.id === selectedTopic.block_id)?.name}
                </SheetDescription>
              </SheetHeader>
              <div className="py-8">
                <p className="text-muted-foreground">
                  Marca el estado de este tema. Esto actualizará tu progreso en el roadmap.
                </p>
                {/* Aquí podrías añadir más info del tema en el futuro */}
              </div>
              <SheetFooter className="flex flex-col gap-2">
                <Button
                  onClick={() => handleStatusChange('completed')}
                  disabled={isPending || currentStatus === 'completed'}
                  size="lg"
                  className="bg-primary hover:bg-primary/90" // Tu color
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentStatus === 'completed' && <Check className="mr-2 h-4 w-4" />}
                  Marcar como Finalizado
                </Button>
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isPending || currentStatus === 'in_progress'}
                  variant="outline"
                  size="lg"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentStatus === 'in_progress' && <Check className="mr-2 h-4 w-4" />}
                  Marcar como "En Curso"
                </Button>
                <Button
                  onClick={() => handleStatusChange('not_started')}
                  disabled={isPending || currentStatus === 'not_started'}
                  variant="ghost"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Marcar como "Sin Empezar"
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </ReactFlowProvider>
  );
}
