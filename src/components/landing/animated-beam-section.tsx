'use client';

import React, { forwardRef, useRef } from 'react';

import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/registry/magicui/animated-beam';
import { Briefcase, CalendarCheck, CheckSquare, BookOpen, Trophy, LineChart } from 'lucide-react';
import { Logo } from '@/components/logo';

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:bg-black',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Circle.displayName = 'Circle';

export function AnimatedBeamSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const testsRef = useRef<HTMLDivElement>(null);
  const planificacionRef = useRef<HTMLDivElement>(null);
  const casosRef = useRef<HTMLDivElement>(null);
  const bloquesRef = useRef<HTMLDivElement>(null);
  const procesoRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[400px] w-full items-center justify-center overflow-hidden p-4"
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-center justify-between gap-10">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={testsRef}>
              <CheckSquare className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground">Tests</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={planificacionRef}>
              <CalendarCheck className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground">Planificación</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={casosRef}>
              <Briefcase className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Casos
              <br />
              Prácticos
            </span>
          </div>
        </div>

        <div
          className="relative z-20 size-24 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center shadow-lg shrink-0"
          ref={centerRef}
        >
          <Logo collapsed className="w-[50px] h-[50px]" />
        </div>

        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={bloquesRef}>
              <BookOpen className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Bloques
              <br />y Temas
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={procesoRef}>
              <Trophy className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Proceso
              <br />
              Selectivo
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={feedbackRef}>
              <LineChart className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Feedback
              <br />
              Progreso
            </span>
          </div>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={testsRef}
        toRef={centerRef}
        curvature={-40}
      />
      <AnimatedBeam containerRef={containerRef} fromRef={planificacionRef} toRef={centerRef} />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={casosRef}
        toRef={centerRef}
        curvature={40}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={bloquesRef}
        toRef={centerRef}
        curvature={-40}
        reverse
      />
      <AnimatedBeam containerRef={containerRef} fromRef={procesoRef} toRef={centerRef} reverse />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={feedbackRef}
        toRef={centerRef}
        curvature={40}
        reverse
      />
    </div>
  );
}
