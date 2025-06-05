"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimerStore } from "@/store/timer-store";

export function TimerCountdown() {
  const { isActive, duration, remainingTime, startTimer, stopTimer, resetTimer, updateRemainingTime } = useTimerStore();
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        updateRemainingTime(Math.max(0, remainingTime - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, remainingTime, updateRemainingTime]);

  const handleStart = () => {
    const totalSeconds = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
    if (totalSeconds > 0) {
      startTimer(totalSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isActive) {
    return (
      <div className="space-y-4 py-4">
        <div className="text-center text-2xl font-mono">
          {formatTime(remainingTime)}
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={stopTimer} variant="outline">
            Pausar
          </Button>
          <Button onClick={resetTimer} variant="outline">
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
      <Button onClick={handleStart} className="w-full">
        Comenzar
      </Button>
    </div>
  );
}
