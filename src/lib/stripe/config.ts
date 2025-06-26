// src/lib/stripe/config.ts

// Asegúrate de que estas variables de entorno estén definidas
// en tu .env.local y en tu proveedor de hosting.

export enum StripePlan {
  FREE = "free",
  BASIC = "basic",
  PRO = "pro",
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
    name: "Plan Gratuito",
    description: "Acceso a funciones esenciales.",
    price: "Gratis",
    type: StripePlan.FREE,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID || "price_free_placeholder",
    features: [
      "Sesiones ilimitadas de estudio y planificacion",
      "Creación de ankicards y flashcards",
      "Cración de mnemotecnias",
      "3 tests diarios",
    ],
  },
  {
    name: "Plan Básico",
    description: "Acceso a funciones esenciales.",
    price: "7€/mes",
    type: StripePlan.BASIC,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID || "price_basic_placeholder",
    features: [
      "Todo lo de la capa gratuita",
      "10 solicitudes por día",
      "Genera tus propios tests",
      "Analiza tu progreso y obtén feedback sobre fallos",
    ],
  },
  {
    name: "Plan Premium",
    description: "Todas las funciones y soporte prioritario.",
    price: "14€/mes",
    type: StripePlan.PRO,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID || "price_premium_placeholder",
    features: [
      "Todo lo del básico",
      "Tests ilimitados",
      "Últimos modelos de IA",
    ],
  },
];

export function getPlanNameByPriceId(
  priceId: string | null | undefined
): string {
  if (!priceId) return "Plan no especificado";
  const plan = STRIPE_PLANS.find((p) => p.priceId === priceId);
  return plan ? plan.name : "Plan Personalizado"; // Fallback si el priceId no se encuentra
}
