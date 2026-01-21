'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimerStore } from '@/store/timer-store';
import { cn, formatDurationForToast } from '@/lib/utils';
import { ConfirmationAdvices } from './confirmation-advices';
import { toast } from '@/hooks/use-toast';

export function TimerCountdown() {
  const {
    isActive,
    startTime,
    remainingTime,
    startTimer,
    stopTimer,
    reset,
    resumeTimer,
    updateRemainingTime,
    saveSessionAndReset,
  } = useTimerStore();
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('45');
  const [advicesConfirmed, setAdvicesConfirmed] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
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
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
    if (totalSeconds > 0) {
      startTimer(totalSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isActive || (!isActive && startTime !== null)) {
    // Estado: Corriendo o Pausado
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
        <div className="flex justify-center gap-2">
          {isActive ? (
            <Button onClick={stopTimer} variant="outline" size="lg">
              Pausar
            </Button>
          ) : (
            <Button onClick={resumeTimer} size="lg" className="w-48">
              Reanudar
            </Button>
          )}
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
            size="lg"
            className="text-muted-foreground hover:text-destructive"
          >
            Terminar estudio
          </Button>
          <Button onClick={reset} variant="ghost" size="lg" className="text-muted-foreground ">
            Reiniciar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="23"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Horas"
        />
        <Input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutos"
        />
      </div>

      <ConfirmationAdvices onAllCheckedChange={setAdvicesConfirmed} />

      <Button
        onClick={handleStart}
        className="w-full"
        size="lg"
        disabled={!advicesConfirmed || (parseInt(hours, 10) === 0 && parseInt(minutes, 10) === 0)}
      >
        Comenzar
      </Button>
    </div>
  );
}
