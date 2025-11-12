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
          <p>
            ¡Estás usando el módulo de Repetición Espaciada (SRS)! El objetivo es ayudarte a
            memorizar conceptos a largo plazo de forma eficiente.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Origen de las tarjetas:</strong> Provienen de las preguntas que has fallado en
              los tests y que marcaste con "➕ Añadir a Repaso".
            </li>
            <li>
              <strong>El Algoritmo:</strong> El sistema te mostrará una tarjeta justo antes de que
              estés a punto de olvidarla. Cuanto mejor la sepas, más tiempo tardará en volver a
              aparecer.
            </li>
          </ul>
          <p className="font-medium text-foreground">¿Qué significa cada botón?</p>
          <ul className="list-none pl-5 space-y-2">
            <li>
              <strong>👎 Otra vez:</strong> Has fallado. La tarjeta se reinicia y te la volveremos a
              mostrar pronto (en esta sesión o al día siguiente).
            </li>
            <li>
              <strong>🤔 Difícil:</strong> La acertaste, pero dudando. Volverá a aparecer un poco
              más tarde que antes (ej: de 3 días pasa a 5).
            </li>
            <li>
              <strong>🙂 Bien:</strong> La sabías. El intervalo de tiempo crece bastante (ej: de 3
              días pasa a 10).
            </li>
            <li>
              <strong>😎 Fácil:</strong> Es una pregunta muy fácil para ti. El intervalo se dispara
              (ej: de 3 días pasa a 20).
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
export default async function ReviewPage() {
  const initialCards = await getDueReviewCards();

  if (initialCards.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto pt-10">
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
    <div className="w-full max-w-2xl mx-auto pt-10">
      <ReviewExplanation />
      <ReviewSession initialCards={initialCards} />
    </div>
  );
}
