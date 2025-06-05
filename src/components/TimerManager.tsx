"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TimerDialog } from "@/components/timer/timer-dialog";
import { useTimerStore } from "@/store/timer-store";
import { PlayCircle } from "lucide-react";

export default function TimerManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isActive } = useTimerStore();

  return (
    <>
      <div className="flex items-center gap-2">
        {isActive ? (
          <span className="text-sm font-medium text-green-600">Sesión de estudio activa</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <PlayCircle className="h-4 w-4" />
            Comenzar sesión de estudio
          </Button>
        )}
      </div>
      <TimerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}