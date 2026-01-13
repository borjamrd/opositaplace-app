'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimerStore } from '@/store/timer-store';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { es } from 'date-fns/locale';

export function TimerManual() {
  const { saveManualSession, setModalOpen } = useTimerStore();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalSeconds = h * 3600 + m * 60;

    if (totalSeconds <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor, introduce un tiempo válido.',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una fecha.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new date object to avoid mutating the original state
      const dateToSave = new Date(date);
      // Set to noon to avoid timezone issues when converting to UTC (00:00 might become previous day)
      dateToSave.setHours(12, 0, 0, 0);

      await saveManualSession(totalSeconds, dateToSave);
      toast({
        title: 'Éxito',
        description: 'Sesión guardada correctamente',
      });
      setModalOpen(false);
      setHours('');
      setMinutes('');
      setDate(new Date());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar la sesión',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
        <p>
          ¿Se te ha olvidado activar el temporizador? ¿Has tenido algún problema con el navegador?
          No te preocupes, puedes registrar aquí tus horas estudiadas. Sé sincero, hazlo por ti.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Horas</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              placeholder="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutos</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" locale={es} selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar sesión'}
        </Button>
      </form>
    </div>
  );
}
