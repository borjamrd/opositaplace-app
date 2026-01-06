// src/lib/stripe/config.ts

export enum StripePlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}
export interface Plan {
  name: string;
  type: StripePlan;
  description: string;
  price: string;
  priceId: string;
  features: {
    label: string;
    isBeta: boolean;
  }[];
}

export const STRIPE_PLANS: Plan[] = [
  {
    name: 'Plan gratuito',
    description: 'Acceso a funciones esenciales. Te encantará.',
    price: 'Gratis',
    type: StripePlan.FREE,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID || 'price_free_placeholder',
    features: [
      {
        label: 'Roadmap de tu temario de estudio',
        isBeta: false,
      },
      {
        label: 'Sesiones ilimitadas de estudio y planificacion',
        isBeta: false,
      },
      {
        label: '1 test semanal disponible en modo aleatorio de 25 preguntas',
        isBeta: false,
      },
      {
        label: 'Analiza tu progreso y obtén feedback sobre fallos',
        isBeta: false,
      },
    ],
  },
  {
    name: 'Plan básico',
    description: 'Acceso a funciones esenciales. Ya no hay excusas.',
    price: '7€/mes',
    type: StripePlan.BASIC,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID || 'price_basic_placeholder',
    features: [
      {
        label: 'Roadmap de tu temario de estudio',
        isBeta: false,
      },
      {
        label: 'Analiza tu progreso y obtén feedback sobre fallos',
        isBeta: false,
      },
      {
        label: 'Creación ilimitada de tests',
        isBeta: false,
      },
      {
        label: 'Tests de mas de 25 preguntas',
        isBeta: false,
      },
      {
        label: 'Tests de convocatorias oficiales',
        isBeta: false,
      },
      {
        label: 'Notificaciones inmediatas de cambios en el proceso selectivo',
        isBeta: false,
      },

      {
        label: 'Gestiona y redacta tu temario de estudio',
        isBeta: true,
      },
    ],
  },
  {
    name: 'Plan avanzado',
    description: 'Profundiza en la materia, vas a por la nota.',
    price: '14€/mes',
    type: StripePlan.PRO,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID || 'price_premium_placeholder',
    features: [
      {
        label: 'Roadmap de tu temario de estudio',
        isBeta: false,
      },
      {
        label: 'Creación ilimitada de tests',
        isBeta: false,
      },
      {
        label: 'Tests de mas de 25 preguntas',
        isBeta: false,
      },
      {
        label: 'Tests de convocatorias oficiales',
        isBeta: false,
      },

      {
        label: 'Notificaciones inmediatas de cambios en el proceso selectivo',
        isBeta: false,
      },
      {
        label: 'Analiza tu progreso y obtén feedback sobre fallos',
        isBeta: false,
      },

      {
        label: 'Creación y corrección de casos prácticos',
        isBeta: false,
      },
      {
        label: 'Resumen semanal de progreso',
        isBeta: false,
      },
      {
        label: 'Gestiona y redacta tu temario de estudio',
        isBeta: true,
      },
    ],
  },
];

export function getPlanNameByPriceId(priceId: string | null | undefined): string {
  if (!priceId) return 'Plan no especificado';
  const plan = STRIPE_PLANS.find((p) => p.priceId === priceId);
  return plan ? plan.name : 'Plan Personalizado';
}
