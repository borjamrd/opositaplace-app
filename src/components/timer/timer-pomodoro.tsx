'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/timer-store';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings';
import { PomodoroSessionType } from '@/store/timer-store';
import { ConfirmationAdvices } from './confirmation-advices';

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerPomodoro() {
    const {
        isActive,
        startTime,
        remainingTime,
        pomodoroDuration,
        shortBreakDuration,
        longBreakDuration,
        activePomodoroSession,
        startTimer,
        stopTimer,
        reset,
        resumeTimer,
        setActivePomodoroSession,
        updateRemainingTime,
    } = useTimerStore();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [advicesConfirmed, setAdvicesConfirmed] = useState(false);

    // Mapeo de duraciones para fácil acceso
    const durations = useMemo(
        () => ({
            pomodoro: pomodoroDuration,
            shortBreak: shortBreakDuration,
            longBreak: longBreakDuration,
        }),
        [pomodoroDuration, shortBreakDuration, longBreakDuration]
    );

    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                // El modo Pomodoro siempre es una cuenta atrás
                const newTime = Math.max(0, remainingTime - 1);
                updateRemainingTime(newTime);
                if (newTime === 0) {
                    stopTimer();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, remainingTime, updateRemainingTime, stopTimer]);

    const handleStart = () => {
        // Inicia el temporizador con la duración de la sesión activa
        startTimer(durations[activePomodoroSession]);
    };

    // El tiempo a mostrar depende de si el temporizador está activo o no
    const displayTime =
        isActive || (!isActive && startTime !== null)
            ? remainingTime
            : durations[activePomodoroSession];

    return (
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Tabs
                    value={activePomodoroSession}
                    onValueChange={(value) =>
                        setActivePomodoroSession(value as PomodoroSessionType)
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                        <TabsTrigger value="shortBreak">Descanso Corto</TabsTrigger>
                        <TabsTrigger value="longBreak">Descanso Largo</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Display del tiempo */}
            <div className="text-center text-6xl font-mono py-6">{formatTime(displayTime)}</div>

            {!isActive && startTime === null && (
                <ConfirmationAdvices onAllCheckedChange={setAdvicesConfirmed} />
            )}

            {/* Botones de control */}
            <div className="flex flex-col items-center justify-center gap-2">
                {!isActive ? (
                    <Button
                        onClick={startTime === null ? handleStart : resumeTimer}
                        className="w-48"
                        size="lg"
                        disabled={startTime === null && !advicesConfirmed}
                    >
                        {startTime === null ? 'COMENZAR' : 'REANUDAR'}
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={stopTimer} variant="outline" size="lg">
                            Pausar
                        </Button>
                        <Button onClick={reset} variant="destructive" size="lg">
                            Reiniciar
                        </Button>
                    </div>
                )}
            </div>
            {/* Diálogo de configuración */}
            <PomodoroSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    );
}
