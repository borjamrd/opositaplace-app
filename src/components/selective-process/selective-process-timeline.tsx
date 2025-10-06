'use client';

import { updateUserCurrentStage, updateUserTrackingStatus } from '@/actions/selective-process';
import { useSelectiveProcess } from '@/lib/supabase/queries/useSelectiveProcess';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useStudySessionStore } from '@/store/study-session-store';
import { CheckCircle, Circle, Milestone } from 'lucide-react';
import { useMemo } from 'react';

export function SelectiveProcessTimeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeOpposition } = useStudySessionStore(); // Obtener la oposición activa del usuario

  const {
    data: processData,
    isLoading,
    isError,
    error,
  } = useSelectiveProcess(activeOpposition?.id);

  // Hook de mutación para actualizar el estado de seguimiento
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({
      processId,
      status,
    }: {
      processId: string;
      status: 'TRACKING' | 'PREPARING';
    }) => {
      const result = await updateUserTrackingStatus(processId, status);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast({
        title: '¡Estado actualizado!',
        description: 'Hemos guardado tu preferencia para este proceso.',
      });
      queryClient.invalidateQueries({ queryKey: ['selectiveProcess', activeOpposition?.id] });
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: err.message,
      });
    },
  });
  const { mutate: updateStage, isPending: isUpdatingStage } = useMutation({
    mutationFn: async ({ processId, nextStageId }: { processId: string; nextStageId: string }) => {
      const result = await updateUserCurrentStage(processId, nextStageId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast({ title: '¡Progreso guardado!' });
      queryClient.invalidateQueries({ queryKey: ['selectiveProcess', activeOpposition?.id] });
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Error al avanzar',
        description: err.message,
      });
    },
  });

  // ✅ Lógica dinámica para el estado de las etapas
  const currentStageIndex = useMemo(() => {
    if (!processData?.userStatus?.current_stage_id || !processData?.stages) return 0;

    const index = processData.stages.findIndex(
      (stage) => stage.id === processData.userStatus?.current_stage_id
    );
    return index === -1 ? 0 : index;
  }, [processData?.stages, processData?.userStatus]);

  const handleStatusUpdate = (status: 'TRACKING' | 'PREPARING') => {
    if (processData?.process.id) {
      updateStatus({ processId: processData.process.id, status });
    }
  };

  const handleStageAdvance = (nextStageId: string) => {
    if (processData?.process.id) {
      updateStage({ processId: processData.process.id, nextStageId });
    }
  };

  // ----- Renderizado -----

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!processData) {
    return (
      <Alert>
        <AlertTitle>Proceso no encontrado</AlertTitle>
        <AlertDescription>
          No hemos encontrado un proceso selectivo activo para tu oposición.
        </AlertDescription>
      </Alert>
    );
  }

  if (!processData.userStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>¡Sigue el proceso de tu oposición!</CardTitle>
          <CardDescription>
            Hemos detectado un proceso en marcha para <strong>{activeOpposition?.name}</strong>.
            ¿Cuál es tu situación?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => handleStatusUpdate('TRACKING')} disabled={isUpdatingStatus}>
            Estoy participando
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('PREPARING')}
            disabled={isUpdatingStatus}
          >
            Me preparo para el futuro
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { process, stages, userStatus } = processData;
  const isTracking = userStatus.tracking_status === 'TRACKING';

  return (
    <Card variant={'borderless'}>
      <CardHeader>
        <CardTitle>
          {isTracking ? 'Mi camino a la plaza' : 'Así funciona el proceso selectivo'}
        </CardTitle>
        <CardDescription>{process.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-8 pl-8">
          {/* Línea vertical del timeline */}
          <div className="absolute left-4 top-4 h-full border-l-2 border-dashed"></div>

          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            const nextStage = stages[index + 1];

            return (
              <div key={stage.id} className="relative flex items-start">
                <div className="absolute -left-8 z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : isCurrent ? (
                    <Milestone className="h-6 w-6 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="w-full">
                  <p
                    className={`font-semibold ${isCurrent ? 'text-primary' : ''} ${
                      isCompleted ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {stage.name}
                  </p>
                  {stage.key_date && (
                    <p className="text-sm text-muted-foreground">
                      Fecha clave: {new Date(stage.key_date).toLocaleDateString()}
                    </p>
                  )}
                  {stage.description && <p className="text-sm mt-1">{stage.description}</p>}

                  {/* ✅ Botón para avanzar de etapa */}
                  {isTracking && isCurrent && nextStage && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleStageAdvance(nextStage.id)}
                      disabled={isUpdatingStage}
                    >
                      {isUpdatingStage ? 'Avanzando...' : `Marcar como completado y avanzar`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
