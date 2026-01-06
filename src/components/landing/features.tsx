'use client';

import { CalendarIcon, FileTextIcon } from '@radix-ui/react-icons';
import { BellIcon, Share2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { AnimatedList } from '@/components/ui/animated-list';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Marquee } from '@/components/ui/marquee';
import { useRef } from 'react';

const files = [
  {
    name: 'Técnicas de estudio.pdf',
    body: 'Método Pomodoro, Active Recall y Spaced Repetition para optimizar tu tiempo.',
  },
  {
    name: 'Constitución.pdf',
    body: 'La norma suprema del ordenamiento jurídico español, a tu alcance.',
  },
  {
    name: 'Esquemas.svg',
    body: 'Visualiza los conceptos clave con mapas mentales y diagramas claros.',
  },
  {
    name: 'Resúmenes.docx',
    body: 'Síntesis de los temas más importantes para repasar rápidamente.',
  },
  {
    name: 'Planificación.xlsx',
    body: 'Organiza tu semana y cumple tus objetivos de estudio sin estrés.',
  },
];

const laws = [
  {
    name: 'Ley 40/2015',
    body: 'Régimen Jurídico del Sector Público',
  },
  {
    name: 'Ley 7/1985',
    body: 'Bases del Régimen Local',
  },
  {
    name: 'Ley 50/1997',
    body: 'Del Gobierno',
  },
  {
    name: 'Ley 39/2015',
    body: 'Procedimiento Administrativo Común',
  },
  {
    name: 'LO 3/1981',
    body: 'Defensor del Pueblo',
  },
  {
    name: 'LO 6/1985',
    body: 'Poder Judicial',
  },
  {
    name: 'Ley 50/1981',
    body: 'Estatuto Orgánico del M. Fiscal',
  },
  {
    name: 'LO 2/1979',
    body: 'Tribunal Constitucional',
  },
  {
    name: 'Constitución Española',
    body: '1978',
  },
  {
    name: 'Ley 33/2003',
    body: 'Patrimonio de las AAPP',
  },
  {
    name: 'RD 1373/2009',
    body: 'Reglamento Patrimonio AAPP',
  },
  {
    name: 'Ley 38/2003',
    body: 'General de Subvenciones',
  },
  {
    name: 'RD 887/2006',
    body: 'Reglamento Gral. Subvenciones',
  },
  {
    name: 'Ley 29/1998',
    body: 'Jurisdicción Contencioso-administrativa',
  },
];

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: 'Nuevo Test Disponible',
    description: 'Constitución Española - Título I',
    time: '15m ago',

    icon: '📝',
    color: '#00C9A7',
  },
  {
    name: 'Objetivo Cumplido',
    description: 'Has completado 3 horas de estudio',
    time: '2h ago',
    icon: '🎯',
    color: '#FFB800',
  },
  {
    name: 'Recordatorio',
    description: 'Repaso programado: Derecho Administrativo',
    time: '5h ago',
    icon: '⏰',
    color: '#FF3D71',
  },
  {
    name: 'Nueva Funcionalidad',
    description: 'Analiza tu progreso con gráficas detalladas',
    time: '1d ago',
    icon: '📊',
    color: '#1E86FF',
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
        // animation styles
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        // light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">{description}</p>
        </div>
      </div>
    </figure>
  );
};

// Animated Beam Demo Component
function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'relative flex h-full w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg bg-background p-10 md:shadow-xl',
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2">
          <div
            ref={div1Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            👤
          </div>
          <div
            ref={div2Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            📚
          </div>
          <div
            ref={div3Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            📝
          </div>
          <div
            ref={div4Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            📅
          </div>
          <div
            ref={div5Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            📊
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div
            ref={div6Ref}
            className="z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
          >
            <img src="/logo.png" alt="OpositaPlace" className="h-10 w-10 object-contain" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div
            ref={div7Ref}
            className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:text-black"
          >
            🎓
          </div>
        </div>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} />
    </div>
  );
}

const features = [
  {
    Icon: FileTextIcon,
    name: 'Sesiones de estudio',
    description: 'Registra y gestiona tus sesiones de estudio diarias.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
              'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
              'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
              'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none'
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: 'Realiza tests',
    description: 'Recibe notificaciones sobre nuevos tests, tus logros y recordatorios de repaso.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedList className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out group-hover:scale-90 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    ),
  },
  {
    Icon: Share2Icon,
    name: 'Casos prácticos',
    description:
      'Integra todo tu flujo de estudio en una sola plataforma: temas, tests y planificación.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: 'Roadmap de estudio',
    description:
      'Visualiza tu progreso y planifica tus repasos con nuestro calendario inteligente.',
    className: 'col-span-3 lg:col-span-1',
    href: '#',
    descriptionAsCta: true,
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out group-hover:scale-90 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
      />
    ),
  },
  {
    Icon: FileTextIcon,
    name: 'Legislación vigente',
    description: 'Accede rápidamente a toda la normativa actualizada de tu oposición.',
    className: 'col-span-3 lg:col-span-3',
    href: '#',
    descriptionAsCta: true,
    background: (
      <Marquee
        pauseOnHover
        reverse
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
      >
        {laws.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              'relative w-52 cursor-pointer overflow-hidden rounded-xl border p-4',
              'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
              'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
              'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none'
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-5xl font-playfair">
          Todo lo que necesitas para tu plaza
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-muted-foreground">
          Una plataforma completa diseñada por y para opositores.
        </p>
        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
