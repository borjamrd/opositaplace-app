'use client';

import React, { forwardRef, useRef } from 'react';

import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/registry/magicui/animated-beam';
import { Briefcase, CalendarCheck, CheckSquare, BookOpen, Trophy } from 'lucide-react';
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

  const div1Ref = useRef<HTMLDivElement>(null); // Tests
  const div2Ref = useRef<HTMLDivElement>(null); // Planificacion
  const div3Ref = useRef<HTMLDivElement>(null); // Casos
  const div4Ref = useRef<HTMLDivElement>(null); // Bloques
  const div5Ref = useRef<HTMLDivElement>(null); // Proceso

  return (
    <div
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-col items-stretch justify-between gap-10">
        {/* Top Row */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={div1Ref}>
              <CheckSquare className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground">Tests</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Circle ref={div2Ref}>
              <CalendarCheck className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground">Planificación</span>
          </div>
        </div>

        {/* Middle Row */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={div3Ref}>
              <Briefcase className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Casos
              <br />
              Prácticos
            </span>
          </div>

          <div
            className="relative z-20 size-24 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center shadow-lg"
            ref={centerRef}
          >
            <div className="flex flex-col items-center justify-center">
              <Logo collapsed className="w-[50px] h-[50px]" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Circle ref={div4Ref}>
              <BookOpen className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Bloques
              <br />y Temas
            </span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={div5Ref}>
              <Trophy className="size-6 text-black dark:text-white" />
            </Circle>
            <span className="text-sm font-semibold text-muted-foreground">Proceso Selectivo</span>
          </div>
        </div>
      </div>

      {/* Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={centerRef}
        curvature={-50}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={centerRef}
        curvature={-50}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={centerRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={centerRef} reverse />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={centerRef}
        curvature={0}
        endYOffset={10}
        reverse
      />
    </div>
  );
}
