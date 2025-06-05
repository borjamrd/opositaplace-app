"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer-store";

export function TimerStopwatch() {
  const { isActive, remainingTime, startTimer, stopTimer, resetTimer, updateRemainingTime } = useTimerStore();

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
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 py-4">
      <div className="text-center text-2xl font-mono">
        {formatTime(remainingTime)}
      </div>
      <div className="flex justify-center gap-2">
        {!isActive ? (
          <Button onClick={handleStart}>Comenzar</Button>
        ) : (
          <>
            <Button onClick={stopTimer} variant="outline">
              Pausar
            </Button>
            <Button onClick={resetTimer} variant="outline">
              Reiniciar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
