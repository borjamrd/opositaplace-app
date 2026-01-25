// src/app/dashboard/help/page.tsx
'use client';

import { submitSupportTicket } from '@/actions/user-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function HelpPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Archivo muy grande',
          description: 'La imagen no debe superar los 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let attachmentUrl = '';

      if (selectedFile) {
        setUploading(true);
        try {
          const supabase = createClient();
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('feedback-attachments')
            .upload(fileName, selectedFile);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('feedback-attachments').getPublicUrl(fileName);

          attachmentUrl = publicUrl;
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error de subida',
            description: 'No se pudo adjuntar la imagen.',
            variant: 'destructive',
          });
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      if (attachmentUrl) {
        formData.set('attachmentUrl', attachmentUrl);
      }

      // 3. Llamar al Server Action
      const result = await submitSupportTicket(null, formData);

      if (result.success) {
        toast({ title: '¡Recibido!', description: 'Hemos recibido tu incidencia.' });
        form.reset();
        setSelectedFile(null);
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Centro de Ayuda</CardTitle>
          <CardDescription>
            ¿Problemas técnicos? Adjunta una captura para que podamos ayudarte más rápido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Ej: No puedo acceder al test de Constitución"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Explica detalladamente qué sucede..."
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Área de Adjuntos */}
            <div className="space-y-2">
              <Label>Adjuntar captura (Opcional)</Label>

              {!selectedFile ? (
                <div className="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors hover:border-primary/50">
                  <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Haz clic para subir una imagen</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 5MB</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => setSelectedFile(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending || uploading}>
              {(isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading
                ? 'Subiendo imagen...'
                : isPending
                  ? 'Enviando ticket...'
                  : 'Enviar incidencia'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
