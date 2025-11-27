'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatAssistant } from './chat-assistant';

export function FloatingAssistantButton() {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button ref={triggerRef} size="lg" className="gap-2">
          <Sparkle className="h-5 w-5" />
          Asistente
          <div className="flex items-center justify-end gap-1">
            <span className="flex items-center rounded-lg bg-foreground  border px-2 font-mono">
              Ctrl
            </span>
            <span className="flex items-center rounded-lg bg-foreground border px-2 font-mono">
              K
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[80vh] p-0">
        <DialogTitle className="hidden">Asistente</DialogTitle>
        <ChatAssistant />
      </DialogContent>
    </Dialog>
  );
}
