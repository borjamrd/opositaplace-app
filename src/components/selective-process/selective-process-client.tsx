'use client';

import { getUserSelectiveProcess } from '@/actions/selective-process';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function SelectiveProcessClient({ oppositionId }: { oppositionId?: string }) {
  const {
    data: fullProcess,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['userSelectiveProcess', oppositionId],
    queryFn: async () => {
      if (!oppositionId) return null;
      return await getUserSelectiveProcess(oppositionId);
    },
    enabled: !!oppositionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos del proceso selectivo. Por favor, inténtalo de nuevo más
          tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (!fullProcess || !fullProcess.process) {
    return (
      <div className="rounded-md border p-4 text-center">
        <p>No se encontró un proceso selectivo activo para esta oposición.</p>
      </div>
    );
  }

  const { process, stages } = fullProcess;

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <h2 className="text-lg font-semibold">{process.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Año: {process.year}</span>
          <Badge
            variant={
              process.status === 'finalizado'
                ? 'default'
                : process.status === 'en_curso'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {process.status === 'finalizado'
              ? 'Finalizado'
              : process.status === 'en_curso'
                ? 'En curso'
                : process.status}
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Etapa</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha clave</TableHead>
              <TableHead>Enlace</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages && stages.length > 0 ? (
              stages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell>{stage.description}</TableCell>
                  <TableCell>{stage.key_date}</TableCell>
                  <TableCell>
                    {stage.official_link && (
                      <Link href={stage.official_link} target="_blank">
                        {stage.official_link}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    {stage.status && (
                      <Badge variant={stage.status === 'completada' ? 'default' : 'outline'}>
                        {stage.status.substring(0, 1).toUpperCase() + stage.status.substring(1)}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No hay etapas definidas para este proceso.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
