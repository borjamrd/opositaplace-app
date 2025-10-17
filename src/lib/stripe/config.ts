// src/lib/stripe/config.ts

// Asegúrate de que estas variables de entorno estén definidas
// en tu .env.local y en tu proveedor de hosting.

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
  priceId: string; // El ID del Precio de Stripe
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
      'Sesiones ilimitadas de estudio y planificacion',
      'Creación de ankicards y flashcards',
      '3 tests diarios',
    ],
  },
  {
    name: 'Plan Básico',
    description: 'Acceso a funciones esenciales. Ya no hay excusas.',
    price: '7€/mes',
    type: StripePlan.BASIC,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID || 'price_basic_placeholder',
    features: [
      'Todo lo de la capa gratuita',
      'Tests ilimitados',
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
      'Todo lo del básico',
      'Genera tests desde el temario',
      'Últimos modelos de IA',
      'Resumen semanal de progreso',
    ],
  },
];

export function getPlanNameByPriceId(priceId: string | null | undefined): string {
  if (!priceId) return 'Plan no especificado';
  const plan = STRIPE_PLANS.find((p) => p.priceId === priceId);
  return plan ? plan.name : 'Plan Personalizado';
}
