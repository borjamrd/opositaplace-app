'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useTimerStore } from '@/store/timer-store';

interface PomodoroSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PomodoroSettingsDialog({ open, onOpenChange }: PomodoroSettingsDialogProps) {
  const { pomodoroDuration, shortBreakDuration, longBreakDuration, setPomodoroDurations } = useTimerStore();

  // Estado local para los inputs (en minutos)
  const [pomodoro, setPomodoro] = useState(pomodoroDuration / 60);
  const [shortBreak, setShortBreak] = useState(shortBreakDuration / 60);
  const [longBreak, setLongBreak] = useState(longBreakDuration / 60);

  const handleSave = () => {
    setPomodoroDurations({
      pomodoro: Number(pomodoro),
      short: Number(shortBreak),
      long: Number(longBreak),
    });
    onOpenChange(false); // Cierra el diálogo al guardar
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Pomodoro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pomodoro" className="text-right">
              Pomodoro
            </Label>
            <Input
              id="pomodoro"
              type="number"
              value={pomodoro}
              onChange={(e) => setPomodoro(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="short-break" className="text-right">
              Descanso Corto
            </Label>
            <Input
              id="short-break"
              type="number"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="long-break" className="text-right">
              Descanso Largo
            </Label>
            <Input
              id="long-break"
              type="number"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}