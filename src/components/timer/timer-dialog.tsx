// src/components/timer/timer-dialog.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimerStore } from '@/store/timer-store';
import { TimerCountdown } from './timer-countdown';
import { TimerPomodoro } from './timer-pomodoro';
import { TimerStopwatch } from './timer-stopwatch';

interface TimerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TimerDialog({ open, onOpenChange }: TimerDialogProps) {
    // 1. OBTENEMOS EL ESTADO NECESARIO DEL STORE
    const { mode, setMode, isActive, startTime } = useTimerStore();

    // 2. DETERMINAMOS SI UN TEMPORIZADOR ESTÁ EN CURSO (ACTIVO O PAUSADO)
    const isTimerSessionActive = isActive || startTime !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[30rem]">
                <DialogHeader>
                    <DialogTitle>Sesión de estudio</DialogTitle>
                </DialogHeader>
                <Tabs
                    value={mode}
                    onValueChange={(value) => {
                        // 3. IMPEDIMOS EL CAMBIO DE PESTAÑA SI HAY UNA SESIÓN ACTIVA
                        if (isTimerSessionActive) return;
                        setMode(value as 'countdown' | 'pomodoro' | 'stopwatch');
                    }}
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="countdown"
                            disabled={isTimerSessionActive && mode !== 'countdown'}
                        >
                            Cuenta atrás
                        </TabsTrigger>
                        <TabsTrigger
                            value="pomodoro"
                            disabled={isTimerSessionActive && mode !== 'pomodoro'}
                        >
                            Pomodoro
                        </TabsTrigger>
                        <TabsTrigger
                            value="stopwatch"
                            disabled={isTimerSessionActive && mode !== 'stopwatch'}
                        >
                            Cronómetro
                        </TabsTrigger>
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
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
