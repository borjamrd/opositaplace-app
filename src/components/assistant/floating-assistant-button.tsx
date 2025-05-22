"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkle } from "lucide-react";
import { ChatAssistant } from "./chat-assistant";

export function FloatingAssistantButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Sparkle className="h-5 w-5" />
            Asistente
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle>Asistente</DialogTitle>
          <ChatAssistant />
        </DialogContent>
      </Dialog>
    </div>
  );
}
