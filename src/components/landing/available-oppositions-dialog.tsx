'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createOppositionRequest } from '@/actions/opposition-requests';

const formSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  oppositionName: z.string().min(1, 'La oposición es obligatoria'),
});

type FormValues = z.infer<typeof formSchema>;

export function AvailableOppositionsDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('oppositionName', data.oppositionName);

    const result = await createOppositionRequest(null, formData);

    if (result.success) {
      toast({
        title: '¡Solicitud recibida!',
        description: 'Te avisaremos en cuanto la oposición esté disponible.',
      });
      setOpen(false);
      reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Ha ocurrido un error al enviar la solicitud.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground hover:text-primary">
          Oposiciones disponibles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4">Oposiciones disponibles</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:flex-row ">
          <Alert className="bg-primary/5 border-primary/20 p-6 md:w-1/2">
            <AlertTitle className="text-lg font-semibold text-primary mb-2 hidden md:block">
              Priorizamos el contenido
            </AlertTitle>
            <AlertDescription className="text-base text-muted-foreground leading-relaxed">
              Preferimos poco pero bien hecho. Por ahora tenemos disponibles:
              <ul className="list-disc list-inside mt-2 font-medium text-muted-foreground">
                <li>Gestión de la Administración Civil del Estado</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-6 md:w-1/2">
            <p className="text-sm text-muted-foreground">
              Si estás estudiando otra oposición, dínoslo para que podamos priorizarla.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="Correo electrónico"
                  type="email"
                  disabled={isSubmitting}
                  className={`h-12 text-lg px-4 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Input
                  id="opposition"
                  placeholder="Oposición"
                  disabled={isSubmitting}
                  className={`h-12 text-lg px-4 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${
                    errors.oppositionName ? 'border-red-500' : ''
                  }`}
                  {...register('oppositionName')}
                />
                {errors.oppositionName && (
                  <p className="text-sm text-red-500">{errors.oppositionName.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg font-semibold rounded-lg mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Avisadme cuando esté disponible'
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
