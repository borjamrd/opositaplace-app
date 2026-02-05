export type TestMode = 'random' | 'errors' | 'topics' | 'exams' | 'mock';

interface EligibilityParams {
  mode: TestMode;
  numQuestions: number;
}

interface SubscriptionStatus {
  status: string | null;
  price_id: string | null;
}

interface EligibilityResult {
  allowed: boolean;
  error?: string;
  reason?: string;
  nextTestDate?: string;
}

export const FREE_PLAN_ID = process.env.NEXT_PUBLIC_STRIPE_FREE_PLAN_ID || 'price_free_placeholder';

export function isTestCreationAllowed(
  subscription: SubscriptionStatus | null,
  lastTestDate: Date | null,
  params?: EligibilityParams
): EligibilityResult {
  // 1. Check Subscription Status
  const isFreePlan =
    !subscription ||
    subscription.price_id === FREE_PLAN_ID ||
    subscription.price_id === 'price_free_placeholder';

  if (!isFreePlan) {
    return { allowed: true };
  }

  // 2. Free Plan Restrictions (if params provided)
  if (params) {
    if (params.mode !== 'random') {
      return {
        allowed: false,
        error: 'Con el plan gratuito solo puedes realizar tests aleatorios.',
        reason: 'premium_feature',
      };
    }

    if (params.numQuestions > 25) {
      return {
        allowed: false,
        error: 'Con el plan gratuito solo puedes realizar tests de hasta 25 preguntas.',
        reason: 'premium_feature',
      };
    }
  }

  // 3. Time Limit (1 test every 7 days)
  if (!lastTestDate) {
    return { allowed: true };
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastTestDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    const nextTestDate = new Date(lastTestDate);
    nextTestDate.setDate(lastTestDate.getDate() + 7);
    return {
      allowed: false,
      reason: 'limit_reached',
      nextTestDate: nextTestDate.toISOString(),
    };
  }

  return { allowed: true };
}
