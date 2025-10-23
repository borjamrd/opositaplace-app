import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Tables } from '@/lib/supabase/database.types';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <TableHead className="text-center">Nota</TableHead>
            <TableHead className="text-center">Correctas</TableHead>
            <TableHead className="text-center">Incorrectas</TableHead>
            {/* <TableHead className="text-center">En Blanco</TableHead> */}
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
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
              {/* <TableCell className="text-center font-medium text-gray-500">
                {attempt.unanswered_questions ?? '-'}
              </TableCell> */}
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/dashboard/tests/${attempt.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Revisar test</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
