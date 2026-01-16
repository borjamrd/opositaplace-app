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
  monthlyPrice: string;
  yearlyPrice: string;
  priceId: string;
  features: {
    label: string;
    isBeta: boolean;
  }[];
}

export const STRIPE_PLANS: Plan[] = [
  {
    name: 'Plan gratuito',
    description: 'Tests gratis limitados y planificación de estudio',
    monthlyPrice: 'Gratis',
    yearlyPrice: 'Gratis',
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
    description: 'Tests ilimitados, planificacion y feedback',
    monthlyPrice: '84€/mes',
    yearlyPrice: '65€/año',
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
        label: 'Resumen básico semanal de progreso',
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
    description: 'Tests, casos prácticos y feedback avanzado',
    monthlyPrice: '25€/mes',
    yearlyPrice: '300€/año',
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
        label: 'Resumen avanzado semanal de progreso',
        isBeta: false,
      },
      {
        label: 'Gestiona y redacta tu temario de estudio',
        isBeta: true,
      },
    ],
  },
];

export const STRIPE_PLANS_MAP = {
  [StripePlan.FREE]: STRIPE_PLANS[0],
  [StripePlan.BASIC]: STRIPE_PLANS[1],
  [StripePlan.PRO]: STRIPE_PLANS[2],
};

export function getPlanByPriceId(priceId: string) {
  return STRIPE_PLANS.find((plan) => plan.priceId === priceId);
}

export function getPlanNameByPriceId(priceId: string | null | undefined): string {
  return STRIPE_PLANS.find((plan) => plan.priceId === priceId)?.name || 'Plan no especificado';
}
