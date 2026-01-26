import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tables } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils';
import { Calendar, Eye, Pen } from 'lucide-react';
import Link from 'next/link';
import { DeleteAttemptDialog } from './delete-attempt-dialog';

type TestAttempt = Tables<'test_attempts'>;

interface TestHistoryTableProps {
  attempts: TestAttempt[];
}

export function TestHistoryTable({ attempts }: TestHistoryTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No has completado ningún test todavía.
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="grid gap-4 md:hidden">
        {attempts.map((attempt) => (
          <Card key={attempt.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(attempt.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <Badge variant="outline" className="font-normal capitalize">
                  {attempt.mode === 'random'
                    ? 'Aleatorio'
                    : attempt.mode === 'errors'
                      ? 'Fallos'
                      : attempt.mode === 'topics'
                        ? 'Por temas'
                        : attempt.mode === 'exams'
                          ? 'Examen'
                          : attempt.mode === 'mock'
                            ? 'Simulacro'
                            : attempt.mode}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Estado</span>
                <Badge
                  className={cn(
                    'w-fit font-semibold',
                    attempt.status === 'completed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300'
                  )}
                >
                  {attempt.status === 'completed' ? 'Completado' : 'En Progreso'}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Nota</span>
                <span
                  className={cn(
                    'font-mono font-bold',
                    attempt.score && Number(attempt.score) >= 5
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {attempt.score ? Number(attempt.score).toFixed(2) : '-'}
                </span>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-2 border-t pt-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Correctas</span>
                  <span className="font-bold text-green-600">{attempt.correct_answers ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Incorrectas</span>
                  <span className="font-bold text-red-600">{attempt.incorrect_answers ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">En blanco</span>
                  <span className="font-bold text-gray-500">
                    {attempt.unanswered_questions ?? '-'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-2 flex justify-end gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8">
                <Link href={`/dashboard/tests/${attempt.id}`}>
                  {attempt.status === 'completed' ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Ver
                    </>
                  ) : (
                    <>
                      <Pen className="mr-2 h-4 w-4" /> Continuar
                    </>
                  )}
                </Link>
              </Button>
              <DeleteAttemptDialog attemptId={attempt.id} />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Nota</TableHead>
              <TableHead className="text-center">Correctas</TableHead>
              <TableHead className="text-center">Incorrectas</TableHead>
              <TableHead className="text-center">En Blanco</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                  {new Date(attempt.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-normal capitalize">
                    {attempt.mode === 'random'
                      ? 'Aleatorio'
                      : attempt.mode === 'errors'
                        ? 'Fallos'
                        : attempt.mode === 'topics'
                          ? 'Por temas'
                          : attempt.mode === 'exams'
                            ? 'Examen'
                            : attempt.mode === 'mock'
                              ? 'Simulacro'
                              : attempt.mode}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      'font-semibold',
                      attempt.status === 'completed'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300'
                    )}
                  >
                    {attempt.status === 'completed' ? 'Completado' : 'En Progreso'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-semibold border-0',
                      attempt.score && Number(attempt.score) >= 5
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {attempt.score ? Number(attempt.score).toFixed(2) : '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium text-green-600">
                  {attempt.correct_answers ?? '-'}
                </TableCell>
                <TableCell className="text-center font-medium text-red-600">
                  {attempt.incorrect_answers ?? '-'}
                </TableCell>
                <TableCell className="text-center font-medium text-gray-500">
                  {attempt.unanswered_questions ?? '-'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/dashboard/tests/${attempt.id}`}>
                        {attempt.status === 'completed' ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <Pen className="h-4 w-4" />
                        )}
                        <span className="sr-only">Revisar test</span>
                      </Link>
                    </Button>
                    <DeleteAttemptDialog attemptId={attempt.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
