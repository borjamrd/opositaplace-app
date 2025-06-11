'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/timer-store';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings';
import { PomodoroSessionType } from '@/store/timer-store';

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerPomodoro() {
    const {
        isActive,
        remainingTime,
        startTimer,
        stopTimer,
        resetTimer,
        pomodoroDuration,
        shortBreakDuration,
        longBreakDuration,
        activePomodoroSession,
        setActivePomodoroSession,
    } = useTimerStore();

    const [settingsOpen, setSettingsOpen] = useState(false);

    // Mapeo de duraciones para fácil acceso
    const durations = useMemo(
        () => ({
            pomodoro: pomodoroDuration,
            shortBreak: shortBreakDuration,
            longBreak: longBreakDuration,
        }),
        [pomodoroDuration, shortBreakDuration, longBreakDuration]
    );

    const handleStart = () => {
        // Inicia el temporizador con la duración de la sesión activa
        startTimer(durations[activePomodoroSession]);
    };

    // El tiempo a mostrar depende de si el temporizador está activo o no
    const displayTime = isActive ? remainingTime : durations[activePomodoroSession];

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

            {/* Botones de control */}
            <div className="flex flex-col items-center justify-center gap-2">
                {!isActive ? (
                    <Button onClick={handleStart} className="w-48" size="lg">
                        COMENZAR
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={stopTimer} variant="outline" size="lg">
                            Pausar
                        </Button>
                        <Button onClick={resetTimer} variant="destructive" size="lg">
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
