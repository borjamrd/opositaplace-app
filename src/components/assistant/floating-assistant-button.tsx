'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Sparkle, Keyboard } from 'lucide-react';
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
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button ref={triggerRef} size="lg" className="gap-2 rounded-2xl">
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
    </div>
  );
}
