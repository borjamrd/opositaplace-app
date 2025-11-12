'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import ReactFlow, {
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  PanOnScrollMode,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { updateTopicStatus } from '@/actions/roadmap';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
        background: 'var(--roadmap-completed-bg)',
        color: 'var(--roadmap-completed-fg)',
        border: '1px solid var(--roadmap-completed-border)',
      };
    case 'in_progress':
      return {
        background: 'var(--roadmap-inprogress-bg)',
        color: 'var(--roadmap-inprogress-fg)',
        border: '1px solid var(--roadmap-inprogress-border)',
      };
    case 'not_started':
    default:
      return {
        background: 'var(--roadmap-default-bg)',
        color: 'var(--roadmap-default-fg)',
        border: '1px solid var(--roadmap-default-border)',
      };
  }
};

function Glossary() {
  const styles = {
    wrapper: {
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 10,
      background: 'var(--color-card)',
      color: 'var(--color-foreground)',
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-md)',
      fontSize: '12px',
    } as React.CSSProperties,
    title: {
      fontWeight: 'bold',
      marginBottom: '8px',
      fontSize: '14px',
      color: 'var(--color-foreground)',
    } as React.CSSProperties,
    description: {
      fontWeight: 'semibold',
      maxWidth: '20rem',
      marginBottom: '8px',
      fontSize: '14px',
      color: 'var(--color-foreground)',
    } as React.CSSProperties,
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      color: 'var(--color-muted-foreground)',
    } as React.CSSProperties,
    item: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
    } as React.CSSProperties,
    colorBox: {
      width: '14px',
      height: '14px',
      marginRight: '8px',
      borderRadius: '3px',
    } as React.CSSProperties,
  };

  const completedStyle = getStatusStyle('completed');
  const inProgressStyle = getStatusStyle('in_progress');
  const notStartedStyle = getStatusStyle('not_started');

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>Glosario</div>
      <div style={styles.description}>
        Este es el camino recomendado de estudio para tu oposición. Haciendo click en cada tema
        podrás actualizar su estado y visualizar a los recursos disponibles.
      </div>
      <ul style={styles.list}>
        <li style={styles.item}>
          <span
            style={{
              ...styles.colorBox,
              background: completedStyle.background,
              borderColor: completedStyle.border,
            }}
          />
          Finalizado
        </li>
        <li style={styles.item}>
          <span
            style={{
              ...styles.colorBox,
              background: inProgressStyle.background,
              borderColor: inProgressStyle.border,
            }}
          />
          En curso
        </li>
        <li style={styles.item}>
          <span
            style={{
              ...styles.colorBox,
              background: notStartedStyle.background,
              borderColor: notStartedStyle.border,
            }}
          />
          Sin empezar
        </li>
      </ul>
    </div>
  );
}

const BLOCK_WIDTH = 400;
const TOPIC_WIDTH = 350;
const NODE_HEIGHT = 50;
const V_SPACING_BLOCK = 100;
const V_SPACING_TOPIC = 70;
const H_SPACING_TOPIC = 300;

// --- FlowCanvas AHORA RECIBE onInit ---
function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onInit, // <-- PROP AÑADIDO
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (event: any, node: Node) => void;
  onInit: (instance: ReactFlowInstance) => void; // <-- TIPO AÑADIDO
}) {
  // Eliminamos el useEffect y useReactFlow de aquí
  return (
    <ReactFlow
      style={{ cursor: 'default' }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodesDraggable={false}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
      // Restricciones de navegación
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      onInit={onInit} // <-- ASIGNAMOS EL PROP
    ></ReactFlow>
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
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [statusMap, setStatusMap] = useState(initialStatusMap);
  const [loadingKey, setLoadingKey] = useState<SyllabusStatus | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    const CENTER_X = 0;

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentY = 0;

    const rootId = `cycle-${initialCycle.id}`;
    nodes.push({
      id: rootId,
      data: { label: `Vuelta ${initialCycle.cycle_number}` },
      position: { x: CENTER_X - BLOCK_WIDTH / 2, y: currentY },
      type: 'input',
      selectable: false,
      style: {
        width: BLOCK_WIDTH,
        height: NODE_HEIGHT,
        borderRadius: 18,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: '#333',
        alignItems: 'center',
        cursor: 'pointer',
        color: 'white',
      },
      sourcePosition: Position.Bottom,
    });

    let prevNodeId = rootId;

    initialBlocks.forEach((block, index) => {
      const isRightSide = index % 2 === 0;

      const topicsInBlock = initialTopics.filter((t) => t.block_id === block.id);
      const branchHeight = topicsInBlock.length * V_SPACING_TOPIC - (V_SPACING_TOPIC - NODE_HEIGHT);
      const totalSectionHeight = Math.max(NODE_HEIGHT, branchHeight) / 2;
      currentY += V_SPACING_BLOCK + totalSectionHeight / 2;
      let topicY = currentY - branchHeight / 2 + NODE_HEIGHT / 2;
      const blockNodeId = `block-${block.id}`;

      nodes.push({
        id: blockNodeId,
        data: { label: `${block.name}` },
        position: { x: CENTER_X - BLOCK_WIDTH / 2, y: currentY },
        selectable: false,
        style: {
          borderRadius: 18,
          width: BLOCK_WIDTH,
          height: 'auto',
          background: 'var(--color-muted)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-muted-foreground)',
          cursor: 'pointer',
          alignItems: 'center',
          fontSize: '0.8rem',
          fontWeight: '600',
        },
        sourcePosition: isRightSide ? Position.Right : Position.Left,
        targetPosition: Position.Top,
      });

      edges.push({
        id: `e-${prevNodeId}-${blockNodeId}`,
        source: prevNodeId,
        target: blockNodeId,
        type: 'smoothstep',
        animated: false,
        sourceHandle: 'bottom',
      });

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
            borderRadius: 18,
            whiteSpace: 'pre-wrap',
            cursor: 'pointer',
          },
          sourcePosition: undefined,
          targetPosition: isRightSide ? Position.Left : Position.Right,
        });

        edges.push({
          id: `e-${blockNodeId}-${topicNodeId}`,
          source: blockNodeId,
          target: topicNodeId,
          type: 'smoothstep',
          animated: status === 'in_progress',
          style: { stroke: '#ccc' },
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

  // --- useEffect SOLO para estilos ---
  // Este useEffect actualiza los colores cuando `statusMap` cambia.
  // Ya NO intenta centrar la vista, evitando el reseteo.
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

    // 2. Si la instancia está lista, centramos la vista
    //    Esto se ejecuta CADA VEZ que statusMap cambia,
    //    corrigiendo el reseteo de vista que causa setNodes.
    if (rfInstance) {
      // 3. Esperamos al siguiente "tick" para que setNodes termine
      setTimeout(() => {
        // 4. Pedimos a fitView que calcule el centrado (X e Y)
        rfInstance.fitView({
          maxZoom: 1,
          minZoom: 1,
          padding: 0.1,
          duration: 0,
        });

        // 5. Obtenemos el viewport que fitView acaba de calcular
        const calculatedViewport = rfInstance.getViewport();

        // 6. Volvemos a setear el viewport, usando el X calculado
        //    pero FORZANDO la Y a 0 (arriba del todo).
        rfInstance.setViewport(
          {
            x: calculatedViewport.x,
            y: 100,
            zoom: 1,
          },
          { duration: 50 } // Una mini-animación para suavizar
        );
      }, 0); // 0ms timeout
    }
    // 7. rfInstance se añade a las dependencias
  }, [statusMap, setNodes, rfInstance]);

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
    setLoadingKey(newStatus);
    const topicId = selectedTopic.id;
    startTransition(async () => {
      const result = await updateTopicStatus(topicId, newStatus);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setLoadingKey(null);
        return;
      }
      setStatusMap((prevMap) => ({
        ...prevMap,
        [topicId]: newStatus,
      }));
      toast({
        title: '¡Actualizado!',
        description: `El "${selectedTopic.name}" se marcó como ${newStatus}.`,
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
      setLoadingKey(null);
    });
  };
  const currentStatus = selectedTopic
    ? statusMap[selectedTopic.id] || 'not_started'
    : 'not_started';

  return (
    <ReactFlowProvider>
      <Glossary />
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onInit={setRfInstance}
      />
      <Sheet open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        <SheetContent>
          {selectedTopic && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTopic.name}</SheetTitle>
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

                    // --- INICIO DEL CAMBIO ---

                    // 1. Comprueba si ESTE botón es el que está cargando.
                    //    (Esto asume que tienes un estado `loadingKey` como muestro más abajo)
                    const isLoadingThisButton = isPending && loadingKey === key;

                    // --- FIN DEL CAMBIO ---

                    return (
                      <Button
                        key={key}
                        onClick={() => handleStatusChange(key as SyllabusStatus)}
                        // 2. El 'disabled' general se mantiene para todos
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
                        {/* 3. El Loader solo se muestra si ESTE botón está cargando */}
                        {isLoadingThisButton && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

                        {/* 4. El Check solo se muestra si está activo Y no está cargando */}
                        {isActive && !isLoadingThisButton && <Check className="mr-1 h-4 w-4" />}

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
