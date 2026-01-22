'use client';
import { discardTestAttempt, submitTestAttempt } from '@/actions/tests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/lib/supabase/database.types';
import { QuestionWithAnswers } from '@/lib/supabase/types';
import { useTestStore } from '@/store/test-store';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle,
  LayoutTemplate,
  LibraryBig,
  Loader2,
  Maximize,
  Minimize,
  Save,
  Trash2,
  X,
  EyeOff, // Nuevo icono
  Flag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { ReportQuestionDialog } from './report-question-dialog';
import { TestSessionNavigation } from './test-session-navigation';
import { TestResults } from './test-results';

interface TestSessionProps {
  testAttempt: Tables<'test_attempts'>;
  questions: QuestionWithAnswers[];
}

export function TestSession({ testAttempt, questions }: TestSessionProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFinished, setIsFinished] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  // Estado para el sistema anti-trampas
  const [isBlurred, setIsBlurred] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    test,
    userAnswers,
    currentQuestionIndex,
    secondsRemaining,
    setTest,
    setUserAnswer,
    setCurrentQuestionIndex,
    setSecondsRemaining,
    reset: resetTestStore,
  } = useTestStore();

  // ... (Tu useEffect de carga inicial y Timer se mantienen igual) ...
  useEffect(() => {
    if (!test || test.id !== testAttempt.id) {
      const allAnswers = questions.flatMap((q) => q.answers);
      setTest(testAttempt, questions, allAnswers);
      if (testAttempt.mode === 'mock' && secondsRemaining === null) {
        setSecondsRemaining(90 * 60);
      }
    }
  }, [test, testAttempt, questions, setTest, secondsRemaining, setSecondsRemaining]);

  useEffect(() => {
    if (testAttempt.mode !== 'mock' || isFinished || secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      handleFinishTest();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, testAttempt.mode, isFinished, setSecondsRemaining]);

  // --- SEGURIDAD Y PANTALLA COMPLETA ---

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);

    // 1. Bloqueo de atajos de teclado y tecla Impr Pant
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+C (Inspector)
      // Bloquear Ctrl+P (Imprimir), Ctrl+S (Guardar)
      // Bloquear Ctrl+C (Copiar)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'c'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast({
          variant: 'destructive',
          title: 'Acción no permitida',
          description: 'Esta acción ha sido bloqueada por seguridad.',
        });
        return false;
      }

      // Detección de Impr Pant (PrintScreen)
      // Nota: En algunos navegadores modernos esto limpia el portapapeles
      if (e.key === 'PrintScreen') {
        setIsBlurred(true); // Castigamos visualmente
        navigator.clipboard.writeText(''); // Limpiamos portapapeles
        toast({
          variant: 'destructive',
          title: 'Captura detectada',
          description: 'Las capturas de pantalla están prohibidas.',
        });
        setTimeout(() => setIsBlurred(false), 2000); // Quitamos blur a los 2s
      }
    };

    // 2. Detección de pérdida de foco (Alt+Tab o cambiar ventana)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // 3. Deshabilitar menú contextual (Click derecho)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Añadir Listeners
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);

    // Anti-copy (evento específico de copiado)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ variant: 'destructive', title: 'No se puede copiar el texto' });
    };
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [toast]);

  // ... (Funciones toggleFullscreen, handleFinishTest, etc. se mantienen igual) ...
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentAnswer = userAnswers.get(currentQuestion?.id);

  // ... (Handlers handleFinishTest, handleDiscard, etc.) ...
  const handleFinishTest = () => {
    startTransition(async () => {
      const answersObject = Object.fromEntries(userAnswers);
      const result = await submitTestAttempt(testAttempt.id, answersObject);
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else if (result?.success) {
        if (document.fullscreenElement) document.exitFullscreen();
        await queryClient.invalidateQueries({ queryKey: ['test-history-summary-rpc'] });
        resetTestStore();
        router.push(`/dashboard/tests/${testAttempt.id}`);
      }
    });
  };

  const handleDiscard = () => {
    startTransition(async () => {
      const res = await discardTestAttempt(testAttempt.id);
      if (res.success) {
        if (document.fullscreenElement) document.exitFullscreen();
        resetTestStore();
        router.push('/dashboard/tests');
      }
    });
  };

  const handleSaveAndExit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    toast({ title: 'Test pausado', description: 'Puedes retomarlo desde el historial.' });
    router.push('/dashboard/tests');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const answersObject = Object.fromEntries(userAnswers);
    return <TestResults questions={questions} userAnswers={answersObject} addedCardIds={[]} />;
  }

  if (!currentQuestion) return <Loader2 className="animate-spin" />;

  const topicData = (currentQuestion as any).topic;
  const blockName = topicData?.block?.name;
  const topicName = topicData?.name;
  const examName = (currentQuestion as any).exam?.name;

  return (
    <div
      ref={containerRef}
      // AÑADIDO: 'select-none' evita que se pueda seleccionar texto con el ratón
      className={`
        bg-background transition-all select-none relative
        ${isFullscreen ? 'p-4 md:p-8 h-screen overflow-y-auto flex flex-col' : ''}
        ${isBlurred ? 'overflow-hidden' : ''} 
      `}
      onContextMenu={(e) => e.preventDefault()} // Refuerzo inline
    >
      {/* CAPA DE BLUR (Protección visual) */}
      {isBlurred && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4">
          <EyeOff className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-destructive">Contenido Oculto</h2>
          <p className="text-muted-foreground mt-2">
            No se permite cambiar de ventana o realizar capturas durante el examen.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setIsBlurred(false)}>
            Volver al examen
          </Button>
        </div>
      )}

      {/* ... (Resto de tu JSX: Header, Botones, Timer, etc.) ... */}
      <div
        className={`${isFullscreen ? 'max-w-8xl' : 'max-w-6xl'}  mx-auto w-full mb-4 flex items-center justify-between ${isBlurred ? 'opacity-0' : 'opacity-100'}`}
      >
        {!isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitDialog(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="mr-2 h-4 w-4" /> Salir
          </Button>
        )}

        {testAttempt.mode === 'mock' && secondsRemaining !== null && (
          <div
            className={`font-mono text-xl font-bold ${secondsRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-primary'}`}
          >
            {formatTime(secondsRemaining)}
          </div>
        )}

        <Button variant="outline" size="sm" className="ml-auto" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <Minimize className="mr-2 h-4 w-4" />
          ) : (
            <Maximize className="mr-2 h-4 w-4" />
          )}
          {isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
        </Button>
      </div>

      <div className={isBlurred ? 'blur-lg pointer-events-none' : ''}>
        <Card
          variant="borderless"
          className={`${isFullscreen ? 'max-w-8xl' : 'max-w-6xl'} mx-auto w-full flex-1 overflow-hidden flex flex-col lg:flex-row`}
        >
          {/* COLUMNA PRINCIPAL (Pregunta) */}
          <div className="flex-1 flex flex-col min-w-0">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-start items-center">
                <div className="flex flex-col items-center md:items-start gap-2 mb-4">
                  <CardTitle>Test en curso</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setShowReportDialog(true)}
                    title="Reportar pregunta"
                  >
                    <Flag className="h-4 w-4" /> Reportar
                  </Button>
                </div>
                {(topicName || blockName || examName) && (
                  <div className="flex flex-col items-center md:items-end gap-1">
                    {examName && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        <BookOpenCheck className="mr-1 h-3 w-3" /> {examName}
                      </Badge>
                    )}
                    {blockName && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <LibraryBig className="mr-1 h-3 w-3" /> {blockName}
                      </Badge>
                    )}
                    {topicName && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <LayoutTemplate className="mr-1 h-3 w-3" /> {topicName}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center lg:text-left">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-3 md:p-6 flex-1 min-h-[300px] overflow-y-auto">
              {/* AÑADIDO: onCopy preventivo inline */}
              <h3
                className="text-lg font-semibold text-muted-foreground mb-6 leading-relaxed"
                onCopy={(e) => e.preventDefault()}
              >
                {currentQuestion.text}
              </h3>

              <RadioGroup
                onValueChange={(value) => setUserAnswer(currentQuestion.id, value)}
                value={currentAnswer || ''}
                className="space-y-3"
              >
                {currentQuestion.answers.map((answer, index) => (
                  <Label
                    key={answer.id}
                    htmlFor={answer.id}
                    className={`flex items-center gap-3 p-4 border rounded-md leading-snug cursor-pointer transition-all select-none
                        hover:bg-accent/50 
                        ${currentAnswer === answer.id ? 'bg-primary/5 border-primary shadow-sm' : ''}
                      `}
                  >
                    <RadioGroupItem value={answer.id} id={answer.id} />
                    <span className="font-semibold text-muted-foreground mr-2 shrink-0">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{answer.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>

            {/* ... (Footer: Botones Anterior/Siguiente) ... */}
            <CardFooter className="flex justify-between pt-6 mt-auto border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
                      <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Test
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent container={containerRef.current}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Una vez finalizado, el test se corregirá.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFinishTest} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sí,
                        finalizar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </div>

          {/* COLUMNA LATERAL (Navegación) */}
          <TestSessionNavigation
            questions={questions}
            userAnswers={userAnswers}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={setCurrentQuestionIndex}
          />
        </Card>
      </div>

      {/* ... (AlertDialog de Salir existente) ... */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent container={containerRef.current}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quieres guardar el intento o lo descartamos?</AlertDialogTitle>
            <AlertDialogDescription>
              Has comenzado un test. Puedes guardarlo para continuar más tarde o descartarlo si no
              deseas guardarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={isPending}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Descartar intento
            </Button>
            <div className="flex gap-2 justify-between md:justify-end w-full">
              <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
              <Button onClick={handleSaveAndExit}>
                <Save className="h-4 w-4" /> Guardar y Salir
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportQuestionDialog
        questionId={currentQuestion.id}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        container={containerRef.current}
      />
    </div>
  );
}
