// src/components/timer/timer-dialog.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimerStore } from '@/store/timer-store';
import { cn } from '@/lib/utils';
import { TimerCountdown } from './timer-countdown';
import { TimerPomodoro } from './timer-pomodoro';
import { TimerStopwatch } from './timer-stopwatch';
import { TimerManual } from './timer-manual';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';

interface TimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimerDialog({ open, onOpenChange }: TimerDialogProps) {
  // 1. OBTENEMOS EL ESTADO NECESARIO DEL STORE
  const { mode, setMode, isActive, startTime } = useTimerStore();
  const [activeTab, setActiveTab] = useState('stopwatch');

  // 2. DETERMINAMOS SI UN TEMPORIZADOR ESTÁ EN CURSO (ACTIVO O PAUSADO)
  const isTimerSessionActive = isActive || startTime !== null;
  const isDropdownActive = ['stopwatch', 'countdown', 'pomodoro', 'manual'].includes(activeTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'transition-all duration-500 ease-in-out',
          isTimerSessionActive ? 'sm:max-w-[50rem]' : 'sm:max-w-[30rem]'
        )}
      >
        <DialogHeader>
          <DialogTitle>Sesión de estudio</DialogTitle>
        </DialogHeader>
        <Tabs
          value={mode}
          onValueChange={(value) => {
            // 3. IMPEDIMOS EL CAMBIO DE PESTAÑA SI HAY UNA SESIÓN ACTIVA
            if (isTimerSessionActive) return;
            setMode(value as 'countdown' | 'pomodoro' | 'stopwatch' | 'manual');
          }}
        >
          <TabsList className="grid w-full grid-cols-7 md:grid-cols-4">
            <TabsTrigger
              className="col-span-2 md:col-span-1"
              value="stopwatch"
              disabled={isTimerSessionActive && mode !== 'stopwatch'}
            >
              Cronómetro
            </TabsTrigger>
            <TabsTrigger
              className="col-span-2 md:col-span-1"
              value="countdown"
              disabled={isTimerSessionActive && mode !== 'countdown'}
            >
              Cuenta atrás
            </TabsTrigger>
            <TabsTrigger
              className="col-span-2 md:col-span-1"
              value="pomodoro"
              disabled={isTimerSessionActive && mode !== 'pomodoro'}
            >
              Pomodoro
            </TabsTrigger>

            {/* Desktop triggers */}
            <TabsTrigger
              className="hidden md:inline-flex"
              value="manual"
              disabled={isTimerSessionActive && mode !== 'manual'}
            >
              Manual
            </TabsTrigger>

            {/* Mobile dropdown trigger */}
            <div className="col-span-1 flex items-center justify-center md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${isDropdownActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab('interface')}>
                    Manual
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TabsList>
          <TabsContent value="countdown">
            <TimerCountdown />
          </TabsContent>
          <TabsContent value="pomodoro">
            <TimerPomodoro />
          </TabsContent>
          <TabsContent value="stopwatch">
            <TimerStopwatch />
          </TabsContent>
          <TabsContent value="manual">
            <TimerManual />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
