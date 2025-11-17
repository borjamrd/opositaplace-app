import { getDueReviewCards } from '@/actions/srs';
import { ReviewSession } from '@/components/review/review-session';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function ReviewExplanation() {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        <CardTitle className="text-sm font-semibold">¿Cómo funciona la Repetición Espaciada?</CardTitle>
      </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
      <p>
        El sistema SRS te muestra tarjetas justo antes de olvidarlas. Las tarjetas provienen de preguntas que fallaste en tests y marcaste para repaso.
      </p>
      <p>
        Cuanto mejor sepas una tarjeta, más tiempo tardará en volver a aparecer. Cuanto peor, más pronto la volverás a ver.
      </p>
      <p>
        Usa los botones (Otra vez, Difícil, Bien, Fácil) para indicar tu confianza y ajustar automáticamente los intervalos de repaso.
      </p>
      </CardContent>
    </Card>
  );
}

export default async function ReviewPage() {
  const initialCards = await getDueReviewCards();

  if (initialCards.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto pt-10">
        <ReviewExplanation />
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>¡Todo listo! 🥳</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">No tienes tarjetas pendientes por hoy.</p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pt-10">
      <ReviewExplanation />
      <ReviewSession initialCards={initialCards} />
    </div>
  );
}
