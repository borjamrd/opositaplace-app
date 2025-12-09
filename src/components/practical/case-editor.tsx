'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2, Send, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveCaseDraft, submitAndCorrectCase } from '@/actions/practical-cases';
import { EditorToolbar } from './editor-toolbar';
import { AICorrectionAnalysis } from '@/lib/supabase/types';

interface CaseEditorProps {
  caseId: string;
  initialContent?: string;
  onCorrectionReceived: (analysis: AICorrectionAnalysis) => void;
}

export function CaseEditor({ caseId, initialContent = '', onCorrectionReceived }: CaseEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

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
    setIsSaving(true);
    const result = await saveCaseDraft(caseId, content);
    setIsSaving(false);

    if (!result.success) {
      console.error('Error guardando borrador');
    }
  }, 2000);

  // Acción de Corregir
  const handleSubmit = () => {
    if (!editor || editor.isEmpty) {
      toast({
        variant: 'destructive',
        title: 'Respuesta vacía',
        description: 'Por favor escribe algo antes de corregir.',
      });
      return;
    }

    const content = editor.getHTML(); // Obtenemos HTML

    startTransition(async () => {
      // 1. Guardamos forzosamente la última versión
      await saveCaseDraft(caseId, content);

      // 2. Llamamos a la IA
      const result = await submitAndCorrectCase(caseId, content);

      if (result.error || !result.feedback) {
        toast({
          variant: 'destructive',
          title: 'Error en la corrección',
          description: result.error || 'Ha ocurrido un error desconocido',
        });
      } else {
        toast({
          title: '¡Corrección completada!',
          description: 'Tu caso ha sido evaluado por la IA.',
        });
        // Pasamos el resultado al componente padre para mostrar el feedback
        onCorrectionReceived(result.feedback);
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
          disabled={isSubmitting || !editor || editor.isEmpty}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Corrigiendo...
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
