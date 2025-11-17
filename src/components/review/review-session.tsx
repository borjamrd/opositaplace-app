'use client';

import { processCardReview } from '@/actions/srs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SrsCard } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, Clock, HelpCircle, Info, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CardContentJson {
  text: string;
  explanation?: string;
}

interface ReviewSessionProps {
  initialCards: SrsCard[];
}

const REVIEW_OPTIONS = [
  { id: 'again', label: 'Otra vez', icon: Clock, color: 'bg-red-100 text-red-700 border-red-200', hover: 'hover:bg-red-200', active: 'ring-2 ring-red-500 scale-110' },
  { id: 'hard', label: 'Difícil', icon: HelpCircle, color: 'bg-orange-100 text-orange-700 border-orange-200', hover: 'hover:bg-orange-200', active: 'ring-2 ring-orange-500 scale-110' },
  { id: 'good', label: 'Bien', icon: ThumbsUp, color: 'bg-blue-100 text-blue-700 border-blue-200', hover: 'hover:bg-blue-200', active: 'ring-2 ring-blue-500 scale-110' },
  { id: 'easy', label: 'Fácil', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200', hover: 'hover:bg-green-200', active: 'ring-2 ring-green-500 scale-110' },
] as const;

type ReviewOptionId = typeof REVIEW_OPTIONS[number]['id'];

export function ReviewSession({ initialCards }: ReviewSessionProps) {
  const [cardsQueue, setCardsQueue] = useState(initialCards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeZone, setActiveZone] = useState<ReviewOptionId | null>(null); // Nuevo: Para feedback visual
  const { toast } = useToast();
  const controls = useAnimation();

  // Valores de movimiento
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transformaciones:
  // Scale: 1 en el origen -> 0.6 al bajar 300px (efecto minimizar hacia el botón)
  const scale = useTransform(y, [0, 300], [1, 0.4]);
  // Rotate: rotación ligera basada en X para sensación natural
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  const currentCard = cardsQueue[0];
  const nextCard = cardsQueue[1];

  // Resetear al cambiar de carta
  useEffect(() => {
    x.set(0);
    y.set(0);
    setActiveZone(null);
  }, [currentCard, x, y]);

  const handleReview = async (rating: ReviewOptionId) => {
    let xDir = 0;
    if (rating === 'again') xDir = -250;
    else if (rating === 'easy') xDir = 250;
    
    // Animación de salida
    await controls.start({ 
      x: xDir, 
      y: 100, 
      opacity: 0, 
      scale: 0.4, 
      transition: { duration: 0.2 } 
    });

    // Optimistic Update
    if (rating === 'again') {
      setCardsQueue((prev) => [...prev.slice(1), prev[0]]);
      toast({ title: 'Repetir', description: 'La verás de nuevo pronto.', duration: 2000 });
    } else {
      setCardsQueue((prev) => prev.slice(1));
    }

    // Reset UI
    setIsFlipped(false);
    controls.set({ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
    x.set(0);
    y.set(0);
    setActiveZone(null);

    try {
      await processCardReview(currentCard.id, rating);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    }
  };

  // Detectar zona activa mientras arrastras
  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y < 50) {
      setActiveZone(null);
      return;
    }
    const width = window.innerWidth;
    const xPos = info.point.x;
    const quarter = width / 4;

    if (xPos < quarter) setActiveZone('again');
    else if (xPos < quarter * 2) setActiveZone('hard');
    else if (xPos < quarter * 3) setActiveZone('good');
    else setActiveZone('easy');
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100; 
    
    // Si no bajó lo suficiente, cancelar
    if (info.offset.y < threshold) {
      controls.start({ x: 0, y: 0, rotate: 0, scale: 1 });
      setActiveZone(null);
      return;
    }

    // Ejecutar la acción basada en la zona activa final
    if (activeZone) {
      handleReview(activeZone);
    } else {
      // Fallback por si acaso
      controls.start({ x: 0, y: 0 });
    }
  };

  if (cardsQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2">¡Sesión completada!</h2>
        <Button asChild size="lg" className="rounded-full px-8 mt-6">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    );
  }

  const frontContent = currentCard.front_content as unknown as CardContentJson;
  const backContent = currentCard.back_content as unknown as CardContentJson;

  return (
    <div className="relative w-full max-w-xl mx-auto h-[650px] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Stack Card (Fondo) */}
      {nextCard && (
        <div className="absolute top-8 w-full max-w-md h-[400px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm scale-95 -translate-y-4 opacity-50 z-0" />
      )}

      {/* Card Activa Draggable */}
      <motion.div
        animate={controls}
        style={{ x, y, rotate, scale, zIndex: 50 }}
        drag={isFlipped ? true : false}
        dragConstraints={{ top: 0, left: -100, right: 100, bottom: 300 }}
        dragElastic={0.1} // Menos elástico para sentir más control al bajar
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className="absolute top-8 w-full max-w-md cursor-grab active:cursor-grabbing touch-none"
      >
        <Card className="h-[400px] shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden relative select-none">
          <CardContent className="p-8 h-full flex flex-col relative">
            <div className="absolute top-4 left-0 w-full text-center">
               <span className="text-xs uppercase tracking-widest text-muted-foreground/50 font-semibold">
                 {isFlipped ? 'Respuesta' : 'Pregunta'}
               </span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
               <h3 className="text-2xl font-medium leading-relaxed">
                 {isFlipped ? backContent.text : frontContent.text}
               </h3>

               {isFlipped && backContent.explanation && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 text-left bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50"
                 >
                   <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                   <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-snug">
                     {backContent.explanation}
                   </p>
                 </motion.div>
               )}
            </div>

            {activeZone && (
               <div className="absolute inset-0 flex items-end justify-center pb-4 bg-black/5 dark:bg-white/5 backdrop-blur-[1px] rounded-xl transition-opacity duration-200">
                 <p className="text-sm font-bold text-primary animate-pulse">
                   Soltar para: {REVIEW_OPTIONS.find(o => o.id === activeZone)?.label}
                 </p>
               </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {!isFlipped && (
        <div className="absolute bottom-20 z-30 w-full max-w-md px-4">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg shadow-lg rounded-xl"
            onClick={() => setIsFlipped(true)}
          >
            Mostrar Respuesta
          </Button>
        </div>
      )}

      {/* Panel de Botones */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t p-6 pb-8"
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">
                Selecciona una dificultad
              </p>
              <div className="grid grid-cols-4 gap-3">
                {REVIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = activeZone === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleReview(option.id)} // ¡CORREGIDO! Usa el ID dinámico
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border",
                        option.color,
                        option.hover,
                        isActive ? option.active : "opacity-80 hover:opacity-100 scale-100"
                      )}
                    >
                      <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-125")} />
                      <span className="text-xs font-bold">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute top-0 text-sm text-muted-foreground font-mono z-10">
        {cardsQueue.length} preguntas pendientes
      </div>
    </div>
  );
}