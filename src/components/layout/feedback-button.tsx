'use client';

import { submitQuickFeedback } from '@/actions/user-feedback';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [idea, setIdea] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!idea.trim()) return;

    const formData = new FormData();
    formData.append('idea', idea);

    startTransition(async () => {
      const result = await submitQuickFeedback(formData);
      if (result.success) {
        toast({ title: '¡Gracias!', description: 'Tu idea nos ayuda a mejorar.' });
        setIdea('');
        setIsOpen(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
          <MessageSquarePlus className="h-4 w-4" />
          <span>Feedback</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={20} className="p-4 flex flex-col gap-3">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">¿Tienes alguna idea?</h4>
          <p className="text-xs text-muted-foreground">Compártela para mejorar Opositaplace.</p>
        </div>

        <Textarea
          placeholder="Me gustaría que..."
          className="min-h-20 resize-none text-sm"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard/help"
            className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
            onClick={() => setIsOpen(false)}
          >
            ¿Necesitas ayuda?
          </Link>
          <Button size="sm" onClick={handleSubmit} disabled={isPending || !idea.trim()}>
            {isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
