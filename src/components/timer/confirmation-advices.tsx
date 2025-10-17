// src/components/timer/confirmation-advices.tsx
'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Smartphone, MousePointerClick, BrainCircuit } from 'lucide-react';

interface ConfirmationAdvicesProps {
  onAllCheckedChange: (allChecked: boolean) => void;
}

const adviceItems = [
  {
    id: 'mobile-away',
    icon: <Smartphone className="h-5 w-5 text-muted-foreground" />,
    label: 'He apartado el móvil',
  },
  {
    id: 'no-distractions',
    icon: <MousePointerClick className="h-5 w-5 text-muted-foreground" />,
    label: 'Me he apartado de posibles distracciones (apps, etc.)',
  },
  {
    id: 'study-well',
    icon: <BrainCircuit className="h-5 w-5 text-muted-foreground" />,
    label: 'Más que estudiar mucho, quiero estudiar bien.',
  },
];

export function ConfirmationAdvices({ onAllCheckedChange }: ConfirmationAdvicesProps) {
  const [checkedState, setCheckedState] = useState({
    'mobile-away': false,
    'no-distractions': false,
    'study-well': false,
  });

  const handleCheckedChange = (id: string, isChecked: boolean) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [id]: isChecked,
    }));
  };

  useEffect(() => {
    const allChecked = Object.values(checkedState).every(Boolean);
    onAllCheckedChange(allChecked);
  }, [checkedState, onAllCheckedChange]);

  return (
    <div className="space-y-4 rounded-lg border bg-background/50 p-4 shadow-inner">
      <h4 className="text-sm font-semibold text-center text-muted-foreground">
        Un último paso antes de empezar...
      </h4>
      {adviceItems.map((item) => (
        <div key={item.id} className="flex items-start space-x-3">
          <Checkbox
            id={item.id}
            checked={checkedState[item.id as keyof typeof checkedState]}
            onCheckedChange={(checked) => handleCheckedChange(item.id, !!checked)}
            className="mt-1"
          />
          <Label
            htmlFor={item.id}
            className="flex items-center gap-2 text-sm font-normal text-muted-foreground cursor-pointer"
          >
            {item.icon}
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
