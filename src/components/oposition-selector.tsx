// src/components/oposition-selector.tsx
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStudySessionStore } from '@/store/study-session-store';
import { Loader2, Check } from 'lucide-react';
import StudyCycleSelector from './study-cycle-selector';
import { updateUserActiveOpposition } from '@/actions/session';
import { useToast } from '@/hooks/use-toast';

const OpositionSelector = ({ collapsed }: { collapsed?: boolean }) => {
  const { oppositions, activeOpposition, selectOpposition } = useStudySessionStore();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSelect = (oppositionId: string) => {
    if (oppositionId === activeOpposition?.id) return;

    startTransition(async () => {
      await selectOpposition(oppositionId);
      const result = await updateUserActiveOpposition(oppositionId);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };

  if (useStudySessionStore.getState().isLoadingOppositions) {
    return (
      <div className="mt-4 px-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!oppositions || oppositions.length === 0) {
    return <p className="mt-4 px-2 text-sm text-muted-foreground">No tienes oposiciones.</p>;
  }

  return (
    <div className="mt-4 px-2 flex flex-col gap-2">
      {!collapsed && (
        <DropdownMenu dir="ltr">
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between w-full h-fit whitespace-pre-line text-left"
              disabled={isPending}
            >
              {isPending
                ? 'Cambiando...'
                : activeOpposition
                  ? activeOpposition.name
                  : 'Selecciona una oposición'}
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {oppositions.map((oppo) => (
              <DropdownMenuItem
                key={oppo.id}
                onClick={() => handleSelect(oppo.id)}
                className="flex justify-betwestuen items-center"
              >
                <span>{oppo.name}</span>
                {activeOpposition?.id === oppo.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {activeOpposition && <StudyCycleSelector collapsed={collapsed} />}
    </div>
  );
};

export default OpositionSelector;
