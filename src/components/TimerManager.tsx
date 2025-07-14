'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimerDialog } from '@/components/timer/timer-dialog';
import { useTimerStore } from '@/store/timer-store';
import { Keyboard, PlayCircle } from 'lucide-react';

function formatTime(mode: string, seconds: number) {
    if (mode === 'pomodoro' || mode === 'countdown') {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    // stopwatch
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerManager() {
    const {
        isActive,
        mode,
        startTime,
        duration,
        remainingTime,
        updateRemainingTime,
        setModalOpen,
        isModalOpen,
    } = useTimerStore();
    const [displayTime, setDisplayTime] = useState(remainingTime);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keyboard shortcut: Ctrl + S to open dialog
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                setModalOpen(true);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setModalOpen]);

    useEffect(() => {
        if (!isActive || !startTime) {
            setDisplayTime(remainingTime);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        function tick() {
            const now = Date.now();
            let newTime = 0;

            if (mode === 'countdown' || mode === 'pomodoro') {
                newTime = Math.max(0, duration - Math.floor((now - (startTime ?? now)) / 1000));

                if (newTime === 0 && useTimerStore.getState().isActive) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    useTimerStore.getState().saveSessionAndReset();
                }
            } else {
                newTime = Math.floor((now - (startTime ?? now)) / 1000);
            }

            setDisplayTime(newTime);
            updateRemainingTime(newTime);
        }
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, startTime, duration, mode, updateRemainingTime]);

    useEffect(() => {
        if (!isActive) setDisplayTime(remainingTime);
    }, [remainingTime, isActive]);

    return (
        <>
            <div className="flex items-center gap-2">
                {isActive ||
                (!isActive && startTime && (remainingTime > 0 || mode === 'stopwatch')) ? (
                    <div className="flex items-center gap-4 text-primary font-mono">
                        <span>Tiempo en curso:</span>
                        <span>{formatTime(mode, displayTime)}</span>
                        {isActive ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => useTimerStore.getState().stopTimer()}
                            >
                                Pausar
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => useTimerStore.getState().resumeTimer()}
                            >
                                Reanudar
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                useTimerStore.getState().saveSessionAndReset();
                            }}
                        >
                            Finalizar
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
                        <PlayCircle className="h-4 w-4" />
                        Sesión de estudio
                        <span className="ml-2 flex items-center rounded border-white border px-2 font-mono">
                            <Keyboard className="h-5 w-5 mr-1" />
                            Ctrl + S
                        </span>
                    </Button>
                )}
            </div>
            <TimerDialog open={isModalOpen} onOpenChange={setModalOpen} />
        </>
    );
}
