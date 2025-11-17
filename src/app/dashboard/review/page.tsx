import { getDueReviewCards } from '@/actions/srs';
import { ReviewSession } from '@/components/review/review-session';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Info } from 'lucide-react';

export function ReviewExplanation() {
  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4" />
            <span>¿Cómo funciona la Repetición Espaciada?</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm text-muted-foreground space-y-3">
          El sistema SRS te muestra tarjetas justo antes de olvidarlas. Las tarjetas provienen de
          preguntas que fallaste en tests y marcaste para repaso. Cuanto mejor sepas una tarjeta,
          más tiempo tardará en volver a aparecer. Cuanto peor, más pronto la volverás a ver. Usa
          los botones (Otra vez, Difícil, Bien, Fácil) para indicar tu confianza y ajustar
          automáticamente los intervalos de repaso.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
export default async function ReviewPage() {
  const initialCards = await getDueReviewCards();

  if (initialCards.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto flex items-center flex-col pt-10">
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
