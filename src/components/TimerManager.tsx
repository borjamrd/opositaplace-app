'use client';

import { TimerDialog } from '@/components/timer/timer-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TimerMode, useTimerStore } from '@/store/timer-store';
import { Brain, Hourglass, Pause, PlayCircle, Timer as TimerIcon, Watch } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function formatTimerValue(seconds: number, includeHours: boolean = false) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (includeHours || h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const CountdownDisplay = ({ time }: { time: number }) => {
  return (
    <div className="flex items-center gap-2 font-mono text-lg font-medium text-primary">
      {formatTimerValue(time, true)}
    </div>
  );
};

const StopwatchDisplay = ({ time }: { time: number }) => {
  return (
    <div className="flex items-center gap-2 font-mono text-lg font-medium text-primary">
      {formatTimerValue(time, true)}
    </div>
  );
};

const PomodoroDisplay = ({ time }: { time: number }) => {
  const { activePomodoroSession } = useTimerStore();

  const getSessionLabel = () => {
    switch (activePomodoroSession) {
      case 'pomodoro':
        return 'Trabajo';
      case 'shortBreak':
        return 'Descanso corto';
      case 'longBreak':
        return 'Descanso largo';
      default:
        return '';
    }
  };

  const getSessionColor = () => {
    switch (activePomodoroSession) {
      case 'pomodoro':
        return 'text-primary';
      case 'shortBreak':
      case 'longBreak':
        return 'text-green-600';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className={cn('text-sm font-medium', getSessionColor())}>{getSessionLabel()}</span>
      <span className="font-mono text-lg font-medium text-primary">{formatTimerValue(time)}</span>
    </div>
  );
};

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

  const getTimerIcon = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'countdown':
        return <Hourglass className="h-4 w-4" />;
      case 'stopwatch':
        return <Watch className="h-4 w-4" />;
      case 'pomodoro':
        return <Brain className="h-4 w-4" />;
      default:
        return <TimerIcon className="h-4 w-4" />;
    }
  };

  const renderTimerDisplay = () => {
    switch (mode) {
      case 'countdown':
        return <CountdownDisplay time={displayTime} />;
      case 'stopwatch':
        return <StopwatchDisplay time={displayTime} />;
      case 'pomodoro':
        return <PomodoroDisplay time={displayTime} />;
      default:
        return null;
    }
  };

  const showActiveTimer =
    isActive || (!isActive && startTime && (remainingTime > 0 || mode === 'stopwatch'));

  return (
    <>
      <div className="flex items-center gap-2">
        {showActiveTimer ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 h-7">
                {getTimerIcon(mode)}
                <span className="capitalize">
                  {mode === 'stopwatch'
                    ? 'Cronómetro'
                    : mode === 'countdown'
                      ? 'Cuenta atrás'
                      : 'Pomodoro'}
                </span>
              </Badge>
              {renderTimerDisplay()}
            </div>

            <div className="flex items-center gap-1">
              {isActive ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => useTimerStore.getState().stopTimer()}
                  title="Pausar"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => useTimerStore.getState().resumeTimer()}
                  title="Reanudar"
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  useTimerStore.getState().saveSessionAndReset();
                }}
              >
                Finalizar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant={'ghost'}
            className="gap-2 text-muted-foreground"
            onClick={() => setModalOpen(true)}
          >
            <PlayCircle className="h-4 w-4" />
            Sesión de estudio
            <span className="hidden md:flex items-center justify-end gap-1">
              <span className="flex items-center rounded-lg border px-2 font-mono text-xs">
                Ctrl
              </span>
              <span className="flex items-center rounded-lg border px-2 font-mono text-xs">S</span>
            </span>
          </Button>
        )}
      </div>
      <TimerDialog open={isModalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
