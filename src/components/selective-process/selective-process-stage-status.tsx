'use client';

import { Badge } from '@/components/ui/badge';
import { ProcessStage } from '@/lib/supabase/types';

export function StageStatusBadge({ stage }: { stage: ProcessStage }) {
  if (stage.status === 'completada') {
    return (
      <Badge
        variant="secondary"
        className="text-xs font-normal bg-green-100 text-green-800 hover:bg-green-200"
      >
        Finalizado
      </Badge>
    );
  }

  if (!stage.key_date) return null;

  const now = new Date();
  const keyDate = new Date(stage.key_date);
  const days = Math.ceil((keyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return (
      <Badge
        variant="secondary"
        className="text-xs font-normal bg-green-100 text-green-800 hover:bg-green-200"
      >
        Plazo finalizado
      </Badge>
    );
  }

  if (days === 0) {
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal bg-red-500/20 text-red-600 border-red-600"
      >
        Finaliza hoy
      </Badge>
    );
  }

  if (days > 3) {
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal bg-yellow-500/20 text-yellow-700 border-yellow-600"
      >
        {days === 1 ? 'Falta 1 día' : `Faltan ${days} días`}
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal bg-red-500/20 text-red-600 border-red-600"
      >
        {days === 1 ? 'Falta 1 día' : `Faltan ${days} días`}
      </Badge>
    );
  }
}
