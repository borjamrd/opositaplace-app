import { getDueReviewCards } from '@/actions/srs';
import { ReviewSession } from '@/components/review/review-session';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/page-container';
import { Info } from 'lucide-react';

export function ReviewExplanation() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
        <Info className="h-5 w-5" />
        <span>¿Cómo funciona?</span>
      </div>
      <div className="text-sm text-muted-foreground space-y-3">
        <p>
          El sistema SRS te muestra tarjetas justo antes de olvidarlas. Las tarjetas provienen de
          preguntas que fallaste en tests y marcaste para repaso.
        </p>
        <p>
          Cuanto mejor sepas una tarjeta, más tiempo tardará en volver a aparecer. Cuanto peor, más
          pronto la volverás a ver.
        </p>
        <p>
          Usa los botones (Otra vez, Difícil, Bien, Fácil) para indicar tu confianza y ajustar
          automáticamente los intervalos de repaso.
        </p>
      </div>
    </div>
  );
}

export default async function ReviewPage() {
  const initialCards = await getDueReviewCards();

  if (initialCards.length === 0) {
    return (
      <PageContainer infoContent={<ReviewExplanation />}>
        <div className="w-full max-w-5xl mx-auto flex items-center flex-col pt-10">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>¡Todo listo! 🥳</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                No tienes tarjetas pendientes por hoy.
              </p>
              <Button asChild>
                <Link href="/dashboard/tests">Realizar un test</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer infoContent={<ReviewExplanation />}>
      <ReviewSession initialCards={initialCards} />
    </PageContainer>
  );
}
