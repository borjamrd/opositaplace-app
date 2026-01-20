'use client';

import { getAllSelectiveProcesses } from '@/actions/selective-process';
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

export function SelectiveProcessClient() {
  const {
    data: processes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['allSelectiveProcesses'],
    queryFn: async () => {
      const data = await getAllSelectiveProcesses();
      return data;
    },
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
          No se pudieron cargar los procesos selectivos. Por favor, inténtalo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes && processes.length > 0 ? (
            processes.map((process) => (
              <TableRow key={process.id}>
                <TableCell className="font-medium">{process.name}</TableCell>
                <TableCell>{process.year}</TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No hay procesos selectivos disponibles.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
