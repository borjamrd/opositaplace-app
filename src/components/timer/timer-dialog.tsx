'use client';

import { useEffect } from 'react';
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
    const { mode, setMode } = useTimerStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[30rem]">
                <DialogHeader>
                    <DialogTitle>Sesión de estudio</DialogTitle>
                </DialogHeader>
                <Tabs
                    value={mode}
                    onValueChange={(value) =>
                        setMode(value as 'countdown' | 'pomodoro' | 'stopwatch')
                    }
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="countdown">Cuenta atrás</TabsTrigger>
                        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                        <TabsTrigger value="stopwatch">Cronómetro</TabsTrigger>
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
