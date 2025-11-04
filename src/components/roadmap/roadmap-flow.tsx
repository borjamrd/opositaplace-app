'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import ReactFlow, {
  Background,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
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

const getStatusStyle = (status: SyllabusStatus | undefined) => {
  switch (status) {
    case 'completed':
      return {
        background: '#E6F4EA',
        color: '#1B5E20',
        border: '1px solid #81C784',
      };
    case 'in_progress':
      return {
        background: '#FFF8E1',
        color: '#795548',
        border: '1px solid #FFB300',
      };
    case 'not_started':
    default:
      return {
        background: '#F5F5F5',
        color: '#616161',
        border: '1px solid #E0E0E0',
      };
  }
};

const BLOCK_WIDTH = 400;
const TOPIC_WIDTH = 350;
const NODE_HEIGHT = 50;
const NODE_WIDTH = 300;
const V_SPACING_BLOCK = 100;
const V_SPACING_TOPIC = 70;
const H_SPACING_TOPIC = 300;

const CENTER_X = H_SPACING_TOPIC + TOPIC_WIDTH + 50;

function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (event: any, node: Node) => void;
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodesDraggable={false}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
    </ReactFlow>
  );
}

export function RoadmapFlow({
  initialBlocks,
  initialTopics,
  initialStatusMap,
  initialCycle,
}: RoadmapFlowProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [statusMap, setStatusMap] = useState(initialStatusMap);
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentY = 0;

    const rootId = `cycle-${initialCycle.id}`;
    nodes.push({
      id: rootId,
      data: { label: `Vuelta ${initialCycle.cycle_number}` },
      position: { x: CENTER_X - NODE_WIDTH / 2, y: currentY },
      type: 'input',
      selectable: false,
      style: {
        width: BLOCK_WIDTH,
        height: NODE_HEIGHT,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: '#333',
        color: 'white',
      },
      sourcePosition: Position.Bottom,
    });

    let prevNodeId = rootId;

    initialBlocks.forEach((block, index) => {
      const isRightSide = index % 2 === 0;

      // a. Calculamos la altura total de la rama de temas PRIMERO
      const topicsInBlock = initialTopics.filter((t) => t.block_id === block.id);
      // Altura total de la rama = (Nº temas * altura_nodo) + ((Nº temas - 1) * espacio)
      // Simplificado: (Nº temas * V_SPACING_TOPIC) - (V_SPACING_TOPIC - NODE_HEIGHT)
      const branchHeight = topicsInBlock.length * V_SPACING_TOPIC - (V_SPACING_TOPIC - NODE_HEIGHT);

      // b. Calculamos el espacio vertical total que ocupará este bloque + ramas
      // Es el máximo entre la altura del bloque y la altura de la rama
      const totalSectionHeight = Math.max(NODE_HEIGHT, branchHeight) / 2;

      // c. Actualizamos Y para el nuevo bloque
      // (Espacio desde el último nodo + la mitad de la altura de la sección)
      currentY += V_SPACING_BLOCK + totalSectionHeight / 2;

      // d. Calculamos dónde debe empezar el PRIMER tema (la Y del bloque - la mitad de la altura de la rama)
      let topicY = currentY - branchHeight / 2 + NODE_HEIGHT / 2;

      // 2a. Crear el NODO DE BLOQUE (Posición Y actualizada)
      const blockNodeId = `block-${block.id}`;

      nodes.push({
        id: blockNodeId,
        data: { label: `${block.name}` },
        position: { x: CENTER_X - BLOCK_WIDTH / 2, y: currentY }, // Centrado
        selectable: false,
        style: {
          width: BLOCK_WIDTH,
          height: NODE_HEIGHT,
          background: 'rgba(0, 0, 0, 0.04)',
          border: '1px solid #E0E0E0',
          fontWeight: '600',
        },
        // Los temas salen de los lados
        sourcePosition: isRightSide ? Position.Right : Position.Left,

        // El tronco (hacia abajo) Y el tronco (hacia arriba)
        // van al centro.
        targetPosition: Position.Top,
        // (Añadimos esto implícitamente al edge, pero el nodo
        // debe tener un "handle" en 'Bottom'.
        // React Flow usará 'sourcePosition' para el edge que sale
        // a los temas, y el 'source' del edge (Bloque->Bloque)
        // que definimos abajo usará 'Position.Bottom' por defecto
        // si no especificamos un 'sourceHandle'.
        // Para ser explícitos, lo mejor es definirlo en el EDGE.)
      });

      // 2b. Crear EDGE (Línea) del nodo anterior a este bloque
      edges.push({
        id: `e-${prevNodeId}-${blockNodeId}`,
        source: prevNodeId,
        target: blockNodeId,
        type: 'smoothstep',
        animated: false,
        sourceHandle: 'bottom',
      });

      // 2c. Crear los NODOS DE TEMA para este bloque
      topicsInBlock.forEach((topic) => {
        const topicNodeId = `topic-${topic.id}`;
        const status = statusMap[topic.id];
        const topicX = isRightSide
          ? CENTER_X + H_SPACING_TOPIC
          : CENTER_X - H_SPACING_TOPIC - TOPIC_WIDTH;

        nodes.push({
          id: topicNodeId,
          data: { label: `${topic.name}` },
          position: { x: topicX, y: topicY },
          style: {
            width: TOPIC_WIDTH,
            height: 'auto',
            ...getStatusStyle(status),
            whiteSpace: 'pre-wrap',
          },
          targetPosition: isRightSide ? Position.Left : Position.Right,
        });

        // 2d. Crear EDGE (Línea) del bloque a este tema
        edges.push({
          id: `e-${blockNodeId}-${topicNodeId}`,
          source: blockNodeId,
          target: topicNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#ccc' },
        });

        // Mover el "cursor Y" para el siguiente tema
        topicY += V_SPACING_TOPIC;
      });

      // 2e. Actualizar el cursor 'currentY' general
      // El siguiente bloque debe empezar después de la sección entera
      currentY += totalSectionHeight / 2;

      // 2f. Guardar este bloque como el "anterior"
      prevNodeId = blockNodeId;
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [initialBlocks, initialTopics, statusMap, initialCycle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id.startsWith('topic-')) {
          const topicId = node.id.replace('topic-', '');
          const status = statusMap[topicId];
          return {
            ...node,
            style: { ...node.style, ...getStatusStyle(status) },
          };
        }
        return node;
      })
    );
  }, [statusMap, setNodes]);

  const handleNodeClick = (event: any, node: Node) => {
    if (node.id.startsWith('topic-')) {
      const topicId = node.id.replace('topic-', '');
      const topic = initialTopics.find((t) => t.id === topicId);
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  };

  const handleStatusChange = (newStatus: SyllabusStatus) => {
    if (!selectedTopic) return;
    const topicId = selectedTopic.id;
    startTransition(async () => {
      const result = await updateTopicStatus(topicId, newStatus);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        return;
      }
      setStatusMap((prevMap) => ({
        ...prevMap,
        [topicId]: newStatus,
      }));
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
      if (result.newCycleStarted) {
        toast({
          title: '¡ENHORABUENA! 🥳',
          description: '¡Has completado una vuelta! Iniciando la Vuelta 2.',
          duration: 5000,
        });
        window.location.reload();
      }
      setSelectedTopic(null);
    });
  };

  const currentStatus = selectedTopic
    ? statusMap[selectedTopic.id] || 'not_started'
    : 'not_started';

  return (
    <ReactFlowProvider>
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
      />
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
                <div className="flex items-center justify-start gap-2 rounded-xl border p-1 bg-muted/30">
                  {[
                    { key: 'completed', label: 'Finalizado' },
                    { key: 'in_progress', label: 'En curso' },
                    { key: 'not_started', label: 'Sin empezar' },
                  ].map(({ key, label }) => {
                    const isActive = currentStatus === key;
                    return (
                      <Button
                        key={key}
                        onClick={() => handleStatusChange(key as SyllabusStatus)}
                        disabled={isPending || isActive}
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className={`transition-all rounded-lg px-3 py-1 text-sm font-medium ${
                          isActive
                            ? key === 'completed'
                              ? 'bg-green-100 text-green-900 border border-green-400 hover:bg-green-200'
                              : key === 'in_progress'
                                ? 'bg-amber-100 text-amber-800 border border-amber-400 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isActive && <Check className="mr-1 h-4 w-4" />}
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </SheetHeader>
              <div className="py-8">
                <p className="text-muted-foreground">
                  Marca el estado de este tema. Esto actualizará tu progreso en el roadmap.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </ReactFlowProvider>
  );
}
