'use client';

import { FileTextIcon } from '@radix-ui/react-icons';
import { BrainIcon, ListCheckIcon, PencilIcon, RepeatIcon } from 'lucide-react';
import Image from 'next/image';

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Marquee } from '@/components/ui/marquee';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Highlighter } from '../ui/highlighter';
import { Item, laws } from './features-data';

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

// Hover Video Component
const HoverVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    const card = videoRef.current?.closest('.group');
    if (card) {
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="absolute right-2 top-2 origin-top bg-muted/20 w-[70%] h-[60%] rounded-md border overflow-hidden transition-all duration-300 ease-out group-hover:scale-[125%] [mask-image:linear-gradient(to_top,transparent_5%,#000_100%)]">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="w-full h-full object-cover object-bottom"
      />
    </div>
  );
};

const features = [
  {
    Icon: FileTextIcon,
    name: 'Sesiones de estudio',
    description: 'Registra y gestiona tus sesiones de estudio diarias.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute right-0 top-0 w-[100%] h-[60%] border-none transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] overflow-hidden rounded-lg">
        <div className="relative h-full w-full rotate-12 scale-125">
          <Image src="/sesion.png" alt="sesion" fill className="object-cover object-center" />
        </div>
      </div>
    ),
  },
  {
    Icon: ListCheckIcon,
    name: 'Proceso selectivo',
    description:
      'Recibe notificaciones sobre el estado de tu proceso selectivo. Verás la información sintetizada sobre qué hacer en cada etapa del proceso.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute right-0 top-0 w-[100%] h-[60%] border-none transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] overflow-hidden rounded-lg">
        <div className="relative h-full w-full rotate-12 scale-125">
          <Image src="/proceso.png" alt="proceso" fill className="object-cover object-top" />
        </div>
      </div>
    ),
  },
  {
    Icon: PencilIcon,
    name: 'Realiza tests',
    description: 'Recibe notificaciones sobre nuevos tests, tus logros y recordatorios de repaso.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute right-0 top-0 w-[100%] h-[60%] border-none transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] overflow-hidden rounded-lg">
        <div className="relative h-full w-full rotate-12 scale-125">
          <Image src="/tests.png" alt="tests" fill className="object-cover object-[100%_20%]" />
        </div>
      </div>
    ),
  },
  {
    Icon: BrainIcon,
    name: 'Explicación de respuestas',
    description:
      'Todas las respuestas cuentan con una explicación detallada que te ayudará a entender mejor la respuesta correcta. Siempre se menciona la ley que respalda la solución.',
    href: '#',
    descriptionAsCta: true,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute right-0 -top-5 w-[100%] h-[80%] border-none transition-all duration-300 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] overflow-hidden rounded-lg">
        <div className="relative h-full w-full rotate-12 scale-125">
          <Image
            src="/revision.png"
            alt="Explicación de respuestas"
            fill
            className="object-cover object-bottom-left"
          />
        </div>
      </div>
    ),
  },
  {
    Icon: RepeatIcon,
    name: 'Repetición espaciada',
    description:
      'Nuestro algoritmo de repetición espaciada te ayudará a recordar mejor la información. Asigna una dificultad estimada a las preguntas que falles y te las recordaremos más adelante.',
    className: 'col-span-3 lg:col-span-1 row-span-2',
    href: '#',
    descriptionAsCta: true,
    background: <HoverVideo src="/repeticion-espaciada.mp4" />,
  },
  {
    Icon: FileTextIcon,
    name: 'Casos prácticos',
    description:
      'Redacta casos prácticos, revisa las correcciones y sugerencias legislativas y compara las fuentes originales con nuestro módulo de Casos Prácticos.',
    className: 'col-span-3 lg:col-span-2',
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
          <Highlighter action="underline" color="var(--primary)" delay={1000}>
            Todo
          </Highlighter>{' '}
          lo que necesitas{' '}
          <span className="text-primary-foreground">
            <Highlighter action="highlight" color="var(--primary)" delay={1000}>
              para estudiar
            </Highlighter>
          </span>
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
