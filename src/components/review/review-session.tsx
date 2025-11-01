'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { processCardReview } from '@/actions/srs';
import { useToast } from '@/hooks/use-toast';
// Asegúrate de importar los tipos desde tu archivo types.ts
import { SrsCard, Json } from '@/lib/supabase/types';
import Link from 'next/link';

// Definimos la estructura del contenido Json para tener tipado
interface CardContentJson {
  text: string;
  explanation?: string;
}

interface ReviewSessionProps {
  initialCards: SrsCard[];
}

export function ReviewSession({ initialCards }: ReviewSessionProps) {
  // Esta es la cola de tarjetas para la sesión actual
  const [cardsQueue, setCardsQueue] = useState(initialCards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Siempre trabajamos con la primera tarjeta de la cola
  const currentCard = cardsQueue[0];

  const handleReview = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setIsSubmitting(true);
    try {
      // 1. Llamamos a la server action para procesar el repaso
      await processCardReview(currentCard.id, rating);

      // 2. Si es 'again', movemos la tarjeta al final de la cola
      //    para que vuelva a salir en esta misma sesión.
      if (rating === 'again') {
        setCardsQueue((prev) => [...prev.slice(1), prev[0]]);
        toast({
          title: 'Repetir',
          description: 'Esta tarjeta volverá a salir en esta sesión.',
        });
      } else {
        // 3. Si es 'hard', 'good', o 'easy', la quitamos de la cola de esta sesión
        setCardsQueue((prev) => prev.slice(1));
      }

      // 4. Reseteamos el estado para la siguiente tarjeta
      setIsFlipped(false);
    } catch (error) {
      toast({
        title: 'Error al procesar',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado ---

  // Estado final: Sesión completada
  if (cardsQueue.length === 0) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-2xl font-bold">¡Sesión completada! 🚀</h2>
            <p className="text-lg text-muted-foreground">
              Has repasado todas tus tarjetas pendientes.
            </p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extraemos el contenido de la tarjeta actual (casteando a nuestro tipo)
  const frontContent = currentCard.front_content as unknown as CardContentJson;
  const backContent = currentCard.back_content as unknown as CardContentJson;

  // Estado principal: Mostrando una tarjeta
  return (
    <div className="w-full max-w-2xl mx-auto pt-10">
      <Card>
        <CardContent className="p-6 min-h-[250px] flex flex-col justify-center">
          {/* Anverso (Pregunta) */}
          <p className="text-xl text-center">{frontContent.text}</p>

          {isFlipped && (
            <>
              <hr className="my-4" />
              {/* Reverso (Respuesta) */}
              <p className="text-xl text-center font-semibold">{backContent.text}</p>
              {backContent.explanation && (
                <p className="text-sm text-muted-foreground text-center mt-2 italic">
                  {backContent.explanation}
                </p>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-4">
          {!isFlipped ? (
            // Botón para voltear la tarjeta
            <Button onClick={() => setIsFlipped(true)} className="w-full">
              Mostrar Respuesta
            </Button>
          ) : (
            // Botones de Autoevaluación
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
              <Button
                variant="destructive"
                onClick={() => handleReview('again')}
                disabled={isSubmitting}
              >
                Otra vez (👎)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview('hard')}
                disabled={isSubmitting}
              >
                Difícil (🤔)
              </Button>
              <Button
                variant="default"
                onClick={() => handleReview('good')}
                disabled={isSubmitting}
              >
                Bien (🙂)
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleReview('easy')}
                disabled={isSubmitting}
              >
                Fácil (😎)
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      <div className="text-center mt-4 text-sm text-muted-foreground">
        Tarjetas restantes en esta sesión: {cardsQueue.length}
      </div>
    </div>
  );
}
