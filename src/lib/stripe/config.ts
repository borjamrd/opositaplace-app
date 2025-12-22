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
  features: string[];
}

export const STRIPE_PLANS: Plan[] = [
  {
    name: 'Plan Gratuito',
    description: 'Acceso a funciones esenciales. Te encantará.',
    price: 'Gratis',
    type: StripePlan.FREE,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID || 'price_free_placeholder',
    features: [
      'Roadmap de tu temario de estudio',
      'Sesiones ilimitadas de estudio y planificacion',
      '1 test semanal disponible en modo aleatorio de 25 preguntas',
      'Analiza tu progreso y obtén feedback sobre fallos',
    ],
  },
  {
    name: 'Plan Básico',
    description: 'Acceso a funciones esenciales. Ya no hay excusas.',
    price: '7€/mes',
    type: StripePlan.BASIC,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID || 'price_basic_placeholder',
    features: [
      'Roadmap de tu temario de estudio',
      'Creación ilimitada de tests',
      'Tests de mas de 25 preguntas',
      'Tests de convocatorias oficiales',
      'Notificaciones inmediatas de cambios en el proceso selectivo',
      'Analiza tu progreso y obtén feedback sobre fallos',
    ],
  },
  {
    name: 'Plan Avanzado',
    description: 'Profundiza en la materia, vas a por la nota.',
    price: '14€/mes',
    type: StripePlan.PRO,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID || 'price_premium_placeholder',
    features: [
      'Roadmap de tu temario de estudio',
      'Creación ilimitada de tests',
      'Tests de mas de 25 preguntas',
      'Tests de convocatorias oficiales',
      'Creación y corrección de casos prácticos',
      'Resumen semanal de progreso',
      'Notificaciones inmediatas de cambios en el proceso selectivo',
      'Analiza tu progreso y obtén feedback sobre fallos',
    ],
  },
];

export function getPlanNameByPriceId(priceId: string | null | undefined): string {
  if (!priceId) return 'Plan no especificado';
  const plan = STRIPE_PLANS.find((p) => p.priceId === priceId);
  return plan ? plan.name : 'Plan Personalizado';
}
