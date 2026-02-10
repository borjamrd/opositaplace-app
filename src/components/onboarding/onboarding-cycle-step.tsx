import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

interface OnboardingCycleStepProps {
  selectedCycle: number;
  onSelectCycle: (cycle: number) => void;
}

export default function OnboardingCycleStep({
  selectedCycle,
  onSelectCycle,
}: OnboardingCycleStepProps) {
  const cycles = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Selecciona el número de vuelta que estás dando al temario. Por defecto es la 1ª vuelta.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cycles.map((cycle) => (
          <Button
            key={cycle}
            type="button"
            variant={selectedCycle === cycle ? 'default' : 'outline'}
            className={cn(
              'h-24 flex flex-col items-center justify-center focus:bg-primary/5 space-y-2 border-2 transition-all hover:scale-105',
              selectedCycle === cycle
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            )}
            onClick={() => onSelectCycle(cycle)}
          >
            <span
              className={`${selectedCycle === cycle ? 'text-primary' : 'text-foreground'} text-2xl font-bold`}
            >
              {cycle}ª
            </span>
            <span className="text-xs font-normal text-muted-foreground">Vuelta</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed border-primary/20">
        <RotateCw className="w-5 h-5 text-primary mr-3" />
        <p className="text-sm text-muted-foreground text-center">
          Si ya has estudiado el temario anteriormente, indícalo para ajustar tu progreso.
        </p>
      </div>
    </div>
  );
}
