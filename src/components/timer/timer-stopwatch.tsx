// src/components/timer/timer-stopwatch.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/timer-store';
import { cn, formatDurationForToast } from '@/lib/utils';
import { ConfirmationAdvices } from './confirmation-advices';
import { toast } from '@/hooks/use-toast';

export function TimerStopwatch() {
  const {
    isActive,
    remainingTime,
    startTimer,
    stopTimer,
    reset,
    resumeTimer, // <-- Importante tenerlo disponible
    startTime,
    updateRemainingTime,
    saveSessionAndReset,
  } = useTimerStore();

  const [advicesConfirmed, setAdvicesConfirmed] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        updateRemainingTime(remainingTime + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, remainingTime, updateRemainingTime]);

  const handleStart = () => {
    startTimer(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 py-4">
      <div
        className={cn(
          'text-center font-mono transition-all duration-500 ease-in-out',
          isActive || startTime !== null ? 'text-6xl md:text-[8rem]' : 'text-5xl'
        )}
      >
        {formatTime(remainingTime)}
      </div>

      {!isActive && startTime === null && (
        <ConfirmationAdvices onAllCheckedChange={setAdvicesConfirmed} />
      )}

      <div className="flex flex-col items-center justify-center gap-2 mt-4">
        {!isActive ? (
          <Button
            // ¡AQUÍ ESTÁ LA LÍNEA CORREGIDA!
            onClick={startTime === null ? handleStart : resumeTimer}
            className="w-48"
            size="lg"
            disabled={startTime === null && !advicesConfirmed}
          >
            {startTime === null ? 'Comenzar' : 'Reanudar'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={stopTimer} variant="outline" size="lg">
              Pausar
            </Button>
          </div>
        )}

        {/* Helper buttons for Reset/Finalize if session is active or paused (meaning session started) */}
        {(isActive || startTime !== null) && (
          <div className="flex gap-2">
            <Button onClick={reset} variant="ghost" size="sm" className="text-muted-foreground ">
              Reiniciar
            </Button>
            <Button
              onClick={async () => {
                const result = await saveSessionAndReset();
                if (result) {
                  toast({
                    title: '¡Sesión guardada!',
                    description: `Has estudiado durante ${formatDurationForToast(result.durationSeconds)}`,
                  });
                }
              }}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              Finalizar estudio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
