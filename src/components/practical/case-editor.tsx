'use client';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2, Save, Send } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  getCorrectionJobStatus,
  saveCaseDraft,
  submitAndCorrectCase,
} from '@/actions/practical-cases';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AICorrectionAnalysis } from '@/lib/supabase/types';
import { EditorToolbar } from './editor-toolbar';

interface CaseEditorProps {
  caseId: string;
  initialContent?: string;
  onCorrectionReceived: (analysis: AICorrectionAnalysis) => void;
  isMock?: boolean;
}

export function CaseEditor({
  caseId,
  initialContent = '',
  onCorrectionReceived,
  isMock = false,
}: CaseEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  // Polling del estado del job
  useEffect(() => {
    if (!pollingJobId) return;

    const interval = setInterval(async () => {
      const statusResult = await getCorrectionJobStatus(pollingJobId);

      if (statusResult.error) {
        clearInterval(interval);
        setPollingJobId(null);
        toast({
          variant: 'destructive',
          title: 'Error verificando estado',
          description: statusResult.error,
        });
        return;
      }

      if (statusResult.status === 'completed' && statusResult.result) {
        clearInterval(interval);
        setPollingJobId(null);
        toast({
          title: '¡Corrección completada!',
          description: 'Tu caso ha sido evaluado.',
        });
        onCorrectionReceived(statusResult.result as unknown as AICorrectionAnalysis);
      } else if (statusResult.status === 'failed') {
        clearInterval(interval);
        setPollingJobId(null);
        toast({
          variant: 'destructive',
          title: 'Error en la corrección',
          description: statusResult.errorMessage || 'Ha ocurrido un error desconocido',
        });
      }
      // Si está pending o processing, seguimos esperando
    }, 2000);

    return () => clearInterval(interval);
  }, [pollingJobId, toast, onCorrectionReceived]);

  // Configuración del editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe tu resolución aquí. Sé preciso y cita artículos legales...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap p-4 focus:outline-none min-h-[400px]',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Trigger del autosave
      debouncedSave(editor.getHTML());
    },
  });

  // Autosave: Espera 2 segundos de inactividad antes de guardar
  const debouncedSave = useDebouncedCallback(async (content: string) => {
    if (isMock) return;

    setIsSaving(true);
    const result = await saveCaseDraft(caseId, content);
    setIsSaving(false);

    if (!result.success) {
      console.error('Error guardando borrador');
    }
  }, 2000);

  const handleSubmit = () => {
    if (!editor || editor.getText().trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Respuesta vacía',
        description: 'Por favor escribe algo antes de corregir.',
      });
      return;
    }

    const content = editor.getHTML(); // Obtenemos HTML

    if (isMock) {
      startTransition(async () => {
        // Simular envío
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast({
          title: 'Corrección simulada completa',
          description: 'Esta es una demostración del proceso de corrección.',
        });

        // Mock result
        const mockAnalysis: AICorrectionAnalysis = {
          score: 85,
          summary:
            'Esta es una corrección simulada. En un caso real, aquí verías un análisis detallado de tu respuesta, con puntos fuertes y áreas de mejora basadas en la legislación vigente.',
          key_points: [
            {
              concept: 'Identificación del Problema',
              present: true,
              explanation: 'Has identificado correctamente el nudo gordiano del caso.',
            },
            {
              concept: 'Aplicación Normativa',
              present: true,
              explanation: 'Buen uso de las referencias legales simuladas.',
            },
          ],
          suggestions: [
            'Seguir practicando la fundamentación jurídica.',
            'Cuidar la estructura de la respuesta para mayor claridad.',
          ],
          legal_check: [
            {
              article: 'Art. 42 (Simulado)',
              status: 'correct',
              comment: 'Bien citado.',
            },
          ],
        };

        onCorrectionReceived(mockAnalysis);
      });
      return;
    }

    startTransition(async () => {
      // 1. Guardamos forzosamente la última versión
      await saveCaseDraft(caseId, content);

      // 2. Llamamos a la IA (que ahora inicia un job)
      const result = await submitAndCorrectCase(caseId, content);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar corrección',
          description: result.error,
        });
      } else if (result.jobId) {
        setPollingJobId(result.jobId);
        toast({
          title: 'Corrección iniciada',
          description:
            'Estoy revisando tu respuesta, te llegará un correo electrónico cuando termine, puedes cambiar de página.',
        });
      }
    });
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (editor) editor.destroy();
    };
  }, [editor]);

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-background shadow-sm h-full">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
      </div>

      {/* Footer / Status Bar */}
      <div className="p-3 border-t bg-muted/10 flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Guardando borrador...
            </>
          ) : (
            <>
              <Save className="w-3 h-3" /> Borrador guardado
            </>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !!pollingJobId || !editor}
          className="gap-2"
        >
          {isSubmitting || pollingJobId ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />{' '}
              {pollingJobId ? 'Procesando...' : 'Enviando...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Corregir
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
