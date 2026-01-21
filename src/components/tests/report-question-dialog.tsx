'use client';

import { reportQuestion } from '@/actions/questions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface ReportQuestionDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container?: HTMLElement | null;
}

export function ReportQuestionDialog({
  questionId,
  open,
  onOpenChange,
  container,
}: ReportQuestionDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleReportQuestion = () => {
    startTransition(async () => {
      const result = await reportQuestion(questionId);

      if (result.success) {
        toast({
          title: 'Pregunta reportada',
          description: 'Gracias por tu reporte. Revisaremos la pregunta.',
        });
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'No se pudo reportar la pregunta.',
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent container={container}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reportar esta pregunta?</AlertDialogTitle>
          <AlertDialogDescription>
            Si encuentras un error en esta pregunta, puedes reportarla para que la revisemos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReportQuestion} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reportar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
