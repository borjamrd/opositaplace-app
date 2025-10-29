import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Eye, Pen } from 'lucide-react';
import Link from 'next/link';
import { DeleteAttemptDialog } from './delete-attempt-dialog';

type TestAttempt = Tables<'test_attempts'>;

interface TestHistoryTableProps {
  attempts: TestAttempt[];
}

export function TestHistoryTable({ attempts }: TestHistoryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Nota</TableHead>
            <TableHead className="text-center">Correctas</TableHead>
            <TableHead className="text-center">Incorrectas</TableHead>
            <TableHead className="text-center">En Blanco</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No has completado ningún test todavía.
              </TableCell>
            </TableRow>
          )}
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
                  className={cn(
                    'font-semibold',
                    attempt.score && Number(attempt.score) >= 5
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300'
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
                <Button asChild variant="ghost" size="icon">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
