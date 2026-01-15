'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { updateTopicStatus } from '@/actions/roadmap';
import { createTestAttempt } from '@/actions/tests';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Block, StudyCycle, SyllabusStatus, Topic } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { BookOpen, CheckCircle2, Circle, Loader2, PlayCircle } from 'lucide-react';

type StatusMap = Record<string, SyllabusStatus>;

interface RoadmapFlowProps {
  initialBlocks: Block[];
  initialTopics: Topic[];
  initialStatusMap: StatusMap;
  initialCycle: StudyCycle;
}

const TopicNode = ({ data }: { data: any }) => {
  const { label, status, isRightSide } = data;

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-500',
      shadow: 'shadow-md shadow-green-500/10',
    },
    in_progress: {
      icon: PlayCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      shadow: 'shadow-md shadow-amber-500/10',
    },
    not_started: {
      icon: Circle,
      color: 'text-muted-foreground',
      bg: 'bg-card',
      border: 'border-border',
      shadow: 'shadow-sm',
    },
  };

  const config = statusConfig[status as SyllabusStatus] || statusConfig.not_started;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative group min-w-[300px] max-w-[350px] rounded-xl border px-4 py-3 transition-all duration-300 cursor-pointer',
        config.bg,
        config.border,
        config.shadow
      )}
    >
      <Handle
        type="target"
        position={isRightSide ? Position.Left : Position.Right}
        className="!bg-transparent !border-0"
      />

      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-full bg-white/80 shrink-0 border', config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
            {label}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">
            {status === 'not_started'
              ? 'Pendiente'
              : status === 'in_progress'
                ? 'En Curso'
                : 'Completado'}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={isRightSide ? Position.Right : Position.Left}
        className="!bg-transparent !border-0"
      />
    </div>
  );
};

const BlockNode = ({ data }: { data: any }) => {
  return (
    <div className="px-6 py-3 rounded-2xl bg-background border-2 border-primary/20 text-primary font-bold text-sm uppercase tracking-widest shadow-sm text-center w-[300px]">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3 !-top-1.5" />
      {data.label}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-primary !w-3 !h-3 !-bottom-1.5"
      />
      {/* Handles laterales para conectar con los temas como antes */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-transparent !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0"
      />
    </div>
  );
};

const CycleNode = ({ data }: { data: any }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl border-4 border-background z-10">
        <BookOpen className="w-9 h-9" />
      </div>
      <div className="mt-3 px-4 py-1 rounded-full bg-muted border font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
    </div>
  );
};

const nodeTypes = {
  topic: TopicNode,
  block: BlockNode,
  cycle: CycleNode,
};

// --- 2. COMPONENTE PRINCIPAL ---

// Constantes ORIGINALES (ligeramente ajustadas para los nuevos tamaños de nodo)
const BLOCK_WIDTH = 400; // Mantengo tu ancho original para cálculos
const TOPIC_WIDTH = 350;
const NODE_HEIGHT = 80; // Ajustado un poco porque las cards nuevas son más altas
const V_SPACING_BLOCK = 140; // Un poco más de aire vertical
const V_SPACING_TOPIC = 100;
const H_SPACING_TOPIC = 350; // Separación horizontal

export function RoadmapFlow({
  initialBlocks,
  initialTopics,
  initialStatusMap,
  initialCycle,
}: RoadmapFlowProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [statusMap, setStatusMap] = useState(initialStatusMap);
  const [loadingKey, setLoadingKey] = useState<SyllabusStatus | null>(null);
  const [isCreatingTest, startTestCreation] = useTransition();
  const [numQuestions, setNumQuestions] = useState(10);

  // --- LÓGICA DE CONSTRUCCIÓN ORIGINAL (Restaurada) ---
  const { initialNodes, initialEdges } = useMemo(() => {
    const CENTER_X = 0;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentY = 0;

    // 1. Nodo Raíz (Ciclo)
    const rootId = `cycle-${initialCycle.id}`;
    nodes.push({
      id: rootId,
      type: 'cycle', // Usamos el nuevo estilo
      draggable: false,
      data: { label: `Vuelta ${initialCycle.cycle_number}` },
      // Ajustamos X para que quede centrado visualmente (el nodo mide aprox 100px, no 400)
      position: { x: CENTER_X - 40, y: currentY },
    });

    let prevNodeId = rootId;

    initialBlocks.forEach((block, index) => {
      const isRightSide = index % 2 === 0;
      const topicsInBlock = initialTopics.filter((t) => t.block_id === block.id);

      // Cálculos originales de altura
      const branchHeight = topicsInBlock.length * V_SPACING_TOPIC - (V_SPACING_TOPIC - NODE_HEIGHT);
      const totalSectionHeight = Math.max(NODE_HEIGHT, branchHeight) / 2;

      currentY += V_SPACING_BLOCK + totalSectionHeight / 2;
      let topicY = currentY - branchHeight / 2 + NODE_HEIGHT / 2;

      const blockNodeId = `block-${block.id}`;

      // 2. Nodo Bloque (Posicionado centralmente como antes)
      nodes.push({
        id: blockNodeId,
        type: 'block', // Nuevo estilo
        draggable: false,
        data: { label: block.name, isRightSide },
        // Ajuste fino de X para centrar el nuevo nodo de bloque (300px ancho -> mitad es 150)
        position: { x: CENTER_X - 150, y: currentY },
      });

      // Conexión Secuencial (Ciclo -> Bloque 1 -> Bloque 2...)
      edges.push({
        id: `e-${prevNodeId}-${blockNodeId}`,
        source: prevNodeId,
        target: blockNodeId,
        type: 'default', // Curva Bezier
        sourceHandle: 'bottom',
        targetHandle: 'top',
        animated: false,
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
      });

      // 3. Nodos Temas (Ramificándose como antes)
      topicsInBlock.forEach((topic) => {
        const topicNodeId = `topic-${topic.id}`;
        const status = statusMap[topic.id];

        // Posición X original
        const topicX = isRightSide ? CENTER_X + H_SPACING_TOPIC : CENTER_X - H_SPACING_TOPIC - 300; // -300 aprox ancho del nodo

        nodes.push({
          id: topicNodeId,
          type: 'topic', // Nuevo estilo
          draggable: false,
          data: { label: topic.name, status, isRightSide },
          position: { x: topicX, y: topicY },
        });

        // Conexión Bloque -> Tema
        edges.push({
          id: `e-${blockNodeId}-${topicNodeId}`,
          source: blockNodeId,
          target: topicNodeId,
          type: 'default', // Curva Bezier
          animated: status === 'in_progress',
          sourceHandle: isRightSide ? 'right' : 'left', // Usamos los handles laterales del bloque
          targetHandle: isRightSide ? 'left' : 'right',
          style: {
            stroke: status === 'completed' ? '#22c55e' : '#cbd5e1',
            strokeWidth: status === 'completed' ? 2 : 1,
          },
        });

        topicY += V_SPACING_TOPIC;
      });

      currentY += totalSectionHeight / 2;
      prevNodeId = blockNodeId;
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [initialBlocks, initialTopics, statusMap, initialCycle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Actualización de estado sin mover nodos (solo data)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'topic') {
          const topicId = node.id.replace('topic-', '');
          const status = statusMap[topicId];
          if (node.data.status !== status) {
            return { ...node, data: { ...node.data, status } };
          }
        }
        return node;
      })
    );
  }, [statusMap, setNodes]);

  // Handlers...
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setRfInstance(instance);

    // Esperamos un instante para asegurar que los nodos se han renderizado
    setTimeout(() => {
      // 1. Primero pedimos a React Flow que calcule el centro horizontal ideal
      instance.fitView({ padding: 0.1, duration: 0 });

      // 2. Obtenemos esa coordenada X centrada
      const { x } = instance.getViewport();

      // 3. Forzamos la vista:
      //    - X: La calculada (centrado horizontalmente)
      //    - Y: 50 (Pegado arriba con un poco de margen)
      //    - Zoom: 1 (Tamaño real, legible)
      instance.setViewport({ x, y: 120, zoom: 0.8 }, { duration: 800 });
    }, 50);
  }, []);
  const handleNodeClick = (event: any, node: Node) => {
    if (node.type === 'topic') {
      const topicId = node.id.replace('topic-', '');
      const topic = initialTopics.find((t) => t.id === topicId);
      if (topic) setSelectedTopic(topic);
    }
  };

  // ... (Lógica de handleCreateTest y handleStatusChange IGUAL que antes)
  const handleStatusChange = (newStatus: SyllabusStatus) => {
    if (!selectedTopic) return;
    setLoadingKey(newStatus);
    const topicId = selectedTopic.id;
    startTransition(async () => {
      const result = await updateTopicStatus(topicId, newStatus);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        setLoadingKey(null);
        return;
      }
      setStatusMap((prev) => ({ ...prev, [topicId]: newStatus }));
      toast({ title: '¡Actualizado!', description: `Estado cambiado a ${newStatus}.` });
      setSelectedTopic(null);
      setLoadingKey(null);
    });
  };

  const handleCreateTest = () => {
    if (!selectedTopic) return;
    const selectedBlock = initialBlocks.find((b) => b.id === selectedTopic.block_id);
    if (!selectedBlock?.opposition_id) return;
    startTestCreation(async () => {
      const result = await createTestAttempt({
        mode: 'topics',
        numQuestions,
        topicIds: [selectedTopic.id],
        oppositionId: selectedBlock.opposition_id as string,
        studyCycleId: initialCycle.id,
      });
      if (result.error)
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    });
  };

  const currentStatus = selectedTopic
    ? statusMap[selectedTopic.id] || 'not_started'
    : 'not_started';

  return (
    // Aquí está el cambio de tamaño que pedías: h-[calc(100vh-X)]
    <div className="h-[calc(100vh-120px)] w-full bg-slate-50/50 relative border rounded-xl overflow-hidden">
      <ReactFlowProvider>
        <Legend />
        <ReactFlow
          nodes={nodes}
          style={{ cursor: 'default' }}
          edges={edges}
          zoomOnScroll={false}
          zoomOnPinch={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onInit={onInit}
          nodeTypes={nodeTypes}
          minZoom={0.8}
          maxZoom={1.5}
        >
          <Background
            color="#94a3b8"
            gap={25}
            size={1}
            variant={BackgroundVariant.Dots}
            className="opacity-20"
          />
          <Controls className="bg-white border-slate-200 shadow-md text-slate-600" />
        </ReactFlow>

        {/* SHEET Lateral (Igual que antes pero más limpio) */}
        <Sheet open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            {selectedTopic && (
              <div className="flex flex-col h-full pt-6">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-2xl flex items-center gap-2">
                    {selectedTopic.name}
                  </SheetTitle>
                  <SheetDescription>
                    Bloque: {initialBlocks.find((b) => b.id === selectedTopic.block_id)?.name}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: 'not_started',
                        label: 'Pendiente',
                        icon: Circle,
                        activeClass: 'bg-slate-100 border-slate-400 text-slate-700',
                      },
                      {
                        key: 'in_progress',
                        label: 'Estudiando',
                        icon: PlayCircle,
                        activeClass: 'bg-amber-100 border-amber-500 text-amber-700',
                      },

                      {
                        key: 'completed',
                        label: 'Completado',
                        icon: CheckCircle2,
                        activeClass: 'bg-green-100 border-green-500 text-green-700',
                      },
                    ].map((option) => {
                      const isActive = currentStatus === option.key;
                      const isLoading = isPending && loadingKey === option.key;
                      return (
                        <Button
                          key={option.key}
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            'h-24 flex flex-col gap-2 border-2 transition-all hover:scale-105',
                            isActive
                              ? option.activeClass
                              : 'border-slate-200 hover:border-slate-300 text-slate-500'
                          )}
                          onClick={() => handleStatusChange(option.key as SyllabusStatus)}
                        >
                          {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <option.icon className="h-6 w-6" />
                          )}
                          <span className="text-xs font-bold uppercase">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <Separator />

                  <Card className="border-dashed border-2 shadow-none bg-slate-50">
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary text-primary-foreground rounded-lg shadow-sm">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Simulacro de Examen</h4>
                          <p className="text-xs text-muted-foreground">
                            Practica preguntas solo de este tema
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm px-1">
                          <span className="text-muted-foreground">Cantidad de preguntas</span>
                          <span className="font-bold bg-white px-2 py-0.5 rounded border">
                            {numQuestions}
                          </span>
                        </div>
                        <Slider
                          min={5}
                          max={50}
                          step={5}
                          value={[numQuestions]}
                          onValueChange={(v) => setNumQuestions(v[0])}
                          className="py-2"
                        />
                        <Button
                          onClick={handleCreateTest}
                          disabled={isCreatingTest}
                          className="w-full h-11 text-base shadow-md"
                        >
                          {isCreatingTest ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <PlayCircle className="mr-2 h-4 w-4" />
                          )}
                          Anímate con un test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </ReactFlowProvider>
    </div>
  );
}

function Legend() {
  return (
    <Card className="absolute top-4 left-4 z-1 w-auto bg-white/90 backdrop-blur border-slate-200 shadow-sm">
      <CardContent className="p-3 flex gap-4">
        {[
          { label: 'Completado', color: 'text-green-600', icon: CheckCircle2 },
          { label: 'En curso', color: 'text-amber-600', icon: PlayCircle },
          { label: 'Pendiente', color: 'text-slate-400', icon: Circle },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700"
          >
            <item.icon className={cn('w-4 h-4', item.color)} />
            <span>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
