'use client';

import { processCardReview } from '@/actions/srs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AutoResizingText } from '@/components/ui/auto-resizing-text';
import { useToast } from '@/hooks/use-toast';
import { SrsCard } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  PanInfo,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { CheckCircle2, Clock, Eye, HelpCircle, Info, ThumbsUp } from 'lucide-react';
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
  {
    id: 'again',
    label: 'Otra vez',
    icon: Clock,
    color: 'bg-red-100 text-red-700 border-red-200',
    hover: 'hover:bg-red-200',
    active: 'ring-2 ring-red-500 scale-110 shadow-lg bg-red-200',
  },
  {
    id: 'hard',
    label: 'Difícil',
    icon: HelpCircle,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    hover: 'hover:bg-orange-200',
    active: 'ring-2 ring-orange-500 scale-110 shadow-lg bg-orange-200',
  },
  {
    id: 'good',
    label: 'Bien',
    icon: ThumbsUp,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    hover: 'hover:bg-blue-200',
    active: 'ring-2 ring-blue-500 scale-110 shadow-lg bg-blue-200',
  },
  {
    id: 'easy',
    label: 'Fácil',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
    hover: 'hover:bg-green-200',
    active: 'ring-2 ring-green-500 scale-110 shadow-lg bg-green-200',
  },
] as const;

type ReviewOptionId = (typeof REVIEW_OPTIONS)[number]['id'];

export function ReviewSession({ initialCards }: ReviewSessionProps) {
  const [cardsQueue, setCardsQueue] = useState(initialCards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeZone, setActiveZone] = useState<ReviewOptionId | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const controls = useAnimation();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const scale = useTransform(y, [0, 300], [1, 0.3]);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  const currentCard = cardsQueue[0];
  const nextCard = cardsQueue[1];

  useEffect(() => {
    x.set(0);
    y.set(0);
    setActiveZone(null);
    setIsDragging(false);
  }, [currentCard, x, y]);

  const handleReview = async (rating: ReviewOptionId) => {
    let xDir = 0;
    if (rating === 'again') xDir = -250;
    else if (rating === 'easy') xDir = 250;

    await controls.start({
      x: xDir,
      y: 100,
      opacity: 0,
      scale: 0.4,
      transition: { duration: 0.2 },
    });

    if (rating === 'again') {
      setCardsQueue((prev) => [...prev.slice(1), prev[0]]);
      toast({ title: 'Repetir', description: 'La verás de nuevo pronto.', duration: 2000 });
    } else {
      setCardsQueue((prev) => prev.slice(1));
    }

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

  const getZoneFromPosition = (xPos: number): ReviewOptionId => {
    const screenCenter = window.innerWidth / 2;
    const containerWidth = Math.min(window.innerWidth, 600);
    const quarterWidth = containerWidth / 4;

    const leftBoundary = screenCenter - quarterWidth;
    const rightBoundary = screenCenter + quarterWidth;

    if (xPos < leftBoundary) return 'again';
    if (xPos < screenCenter) return 'hard';
    if (xPos < rightBoundary) return 'good';
    return 'easy';
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y < 30) {
      setActiveZone(null);
      return;
    }
    const zone = getZoneFromPosition(info.point.x);
    setActiveZone(zone);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 80;

    if (info.offset.y < threshold) {
      controls.start({ x: 0, y: 0, rotate: 0, scale: 1 });
      setActiveZone(null);
      return;
    }

    if (activeZone) {
      handleReview(activeZone);
    } else {
      const zone = getZoneFromPosition(info.point.x);
      handleReview(zone);
    }
  };

  if (cardsQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2">¡Sesión completada!</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md px-4">
          Has repasado todas tus tarjetas pendientes por hoy.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    );
  }

  const frontContent = currentCard.front_content as unknown as CardContentJson;
  const backContent = currentCard.back_content as unknown as CardContentJson;

  return (
    <div className="relative w-full max-w-xl mx-auto h-[750px] flex flex-col items-center justify-center overflow-hidden">
      {nextCard && (
        <div className="absolute top-8 w-full max-w-md h-[550px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm scale-95 -translate-y-4 opacity-50 z-0" />
      )}

      <motion.div
        animate={controls}
        style={{ x, y, rotate, scale, zIndex: 50 }}
        drag={isFlipped ? true : false}
        dragConstraints={{ top: 0, left: -200, right: 200, bottom: 300 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className="absolute top-8 w-full max-w-md cursor-grab active:cursor-grabbing touch-none px-4 sm:px-0"
      >
        <Card className="h-[550px] shadow-xl rounded-4xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden relative select-none">
          <CardContent className="p-8 h-full flex flex-col relative">
            <div className="absolute top-4 left-0 w-full text-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground/50 font-semibold">
                {isFlipped ? 'Respuesta' : 'Pregunta'}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 w-full overflow-hidden">
              <AutoResizingText
                text={isFlipped ? backContent.text : frontContent.text}
                className="font-medium px-2"
                minFontSize={16}
                maxFontSize={28}
              />

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

            {/* Feedback Overlay */}
            {activeZone && (
              <div className="absolute inset-0 flex items-end justify-center pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-xl transition-all duration-200 z-10">
                <p
                  className={cn(
                    'text-lg font-bold animate-bounce',
                    activeZone === 'again' && 'text-red-600',
                    activeZone === 'hard' && 'text-orange-600',
                    activeZone === 'good' && 'text-blue-600',
                    activeZone === 'easy' && 'text-green-600'
                  )}
                >
                  {REVIEW_OPTIONS.find((o) => o.id === activeZone)?.label}
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
            <Eye className="w-8 h-8 shrink-0" />
            Mostrar respuesta
          </Button>
        </div>
      )}

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
              <p className="text-center text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold h-4">
                {isDragging
                  ? activeZone
                    ? 'Suelta para confirmar'
                    : 'Arrastra para seleccionar'
                  : 'Selecciona una dificultad'}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {REVIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = activeZone === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleReview(option.id)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border',
                        option.color,
                        option.hover,
                        isActive ? option.active : 'opacity-70 hover:opacity-100 scale-100'
                      )}
                    >
                      <Icon
                        className={cn('w-6 h-6 transition-transform', isActive && 'scale-125')}
                      />
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
