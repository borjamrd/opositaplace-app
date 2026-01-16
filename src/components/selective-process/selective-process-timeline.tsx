'use client';

import { updateUserCurrentStage, updateUserTrackingStatus } from '@/actions/selective-process';
import { useSelectiveProcess } from '@/lib/supabase/queries/useSelectiveProcess';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { FullUserProcess, ProcessStage } from '@/lib/supabase/types';
import { useStudySessionStore } from '@/store/study-session-store';
import { CheckCircle, Circle, Info, Milestone } from 'lucide-react';
import { useMemo } from 'react';

export function SelectiveProcessTimeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeOpposition } = useStudySessionStore();

  const {
    data: processData,
    isLoading,
    isError,
    error,
  } = useSelectiveProcess(activeOpposition?.id);

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
    onMutate: async ({ nextStageId }) => {
      await queryClient.cancelQueries({ queryKey: ['selectiveProcess', activeOpposition?.id] });
      const previousProcessData = queryClient.getQueryData<FullUserProcess>([
        'selectiveProcess',
        activeOpposition?.id,
      ]);

      if (previousProcessData && previousProcessData.userStatus) {
        queryClient.setQueryData<FullUserProcess>(['selectiveProcess', activeOpposition?.id], {
          ...previousProcessData,
          userStatus: {
            ...previousProcessData.userStatus,
            current_stage_id: nextStageId,
          },
        });
      }

      return { previousProcessData };
    },
    onSuccess: () => {
      toast({ title: '¡Progreso guardado!' });
    },
    onError: (err, _variables, context) => {
      if (context?.previousProcessData) {
        queryClient.setQueryData(
          ['selectiveProcess', activeOpposition?.id],
          context.previousProcessData
        );
      }
      toast({
        variant: 'destructive',
        title: 'Error al avanzar',
        description: err.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['selectiveProcess', activeOpposition?.id] });
    },
  });

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

  const pendingDays = (stage: ProcessStage) => {
    if (!stage.key_date) return 'Pendiente';
    const days = Math.ceil(
      (new Date(stage.key_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? `Faltan ${days} días` : 'Hoy es el último día';
  };

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
            ¿Cuál es tu situación? "Me preparo para el futuro" implica que por ahora quieres
            estudiar sin estar inscrito en un proceso selectivo
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
    <Card>
      <CardHeader>
        <CardTitle>
          {isTracking ? 'Mi proceso selectivo' : 'Así funciona el proceso selectivo'}
        </CardTitle>
        <CardDescription>{process.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-8 pl-8">
          <div className="absolute left-4 top-4 h-full border-l-2 border-dashed"></div>

          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            const nextStage = stages[index + 1];

            return (
              <div key={stage.id} className="relative flex items-start group">
                <div className="absolute -left-8 z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : isCurrent ? (
                    <Milestone className="h-5 w-5 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="w-full ms-2 mt-2">
                  <div
                    className={` ${isCurrent ? 'text-primary font-semibold' : ''} ${
                      isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                    } flex items-center`}
                  >
                    {stage.name}
                    {stage.description && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label="Información de la fase"
                            className="ml-2 inline-flex items-center rounded-md p-1 text-muted-foreground hover:bg-muted/5"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs">
                          <p className="text-sm">{stage.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {stage.key_date && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {new Date(stage.key_date!).toLocaleDateString()}
                      </Badge>
                      {stage.status === 'pendiente' && (
                        <Badge variant="default" className="text-xs font-normal">
                          {pendingDays(stage)}
                        </Badge>
                      )}
                      {stage.status === 'completada' && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          Finalizado
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* ✅ Botón para avanzar de etapa */}
                  {isTracking && isCurrent && nextStage && (
                    <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-h-14 group-hover:opacity-100">
                      <Button
                        size="sm"
                        className="mt-2 translate-y-4 transition-transform duration-300 group-hover:translate-y-0"
                        onClick={() => handleStageAdvance(nextStage.id)}
                        disabled={isUpdatingStage}
                      >
                        {isUpdatingStage ? 'Avanzando...' : `Marcar como completado y avanzar`}
                      </Button>
                    </div>
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
