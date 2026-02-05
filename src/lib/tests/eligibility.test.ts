import { describe, it, expect, vi } from 'vitest';
import { isTestCreationAllowed, FREE_PLAN_ID } from './eligibility';

describe('isTestCreationAllowed', () => {
  const today = new Date('2024-01-10T12:00:00Z');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('Premium/Trial Subscribers', () => {
    const activeSub = { status: 'active', price_id: 'price_premium_123' };
    const trialSub = { status: 'trialing', price_id: 'price_premium_123' };

    it('allows everything for active premium subscription', () => {
      const result = isTestCreationAllowed(activeSub, null, { mode: 'errors', numQuestions: 100 });
      expect(result.allowed).toBe(true);
    });

    it('allows everything for trialing premium subscription', () => {
      const result = isTestCreationAllowed(trialSub, null, { mode: 'topics', numQuestions: 50 });
      expect(result.allowed).toBe(true);
    });
  });

  describe('Free Plan Users', () => {
    const freeSub = { status: 'active', price_id: FREE_PLAN_ID };
    const noSub = null;

    it('disallows non-random modes', () => {
      const result = isTestCreationAllowed(freeSub, null, { mode: 'errors', numQuestions: 20 });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('premium_feature');
    });

    it('disallows tests with > 25 questions', () => {
      const result = isTestCreationAllowed(freeSub, null, { mode: 'random', numQuestions: 26 });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('premium_feature');
    });

    it('allows random test with <= 25 questions', () => {
      const result = isTestCreationAllowed(freeSub, null, { mode: 'random', numQuestions: 25 });
      expect(result.allowed).toBe(true);
    });

    it('works same for no subscription (treated as free)', () => {
      const result = isTestCreationAllowed(noSub, null, { mode: 'random', numQuestions: 25 });
      expect(result.allowed).toBe(true);
    });
  });

  describe('Time Limits (7 days rule for Free Plan)', () => {
    const freeSub = { status: 'active', price_id: FREE_PLAN_ID };

    it('allows first test ever', () => {
      const result = isTestCreationAllowed(freeSub, null);
      expect(result.allowed).toBe(true);
    });

    it('blocks test if last test was < 7 days ago', () => {
      const lastTestDate = new Date(today);
      lastTestDate.setDate(today.getDate() - 3); // 3 days ago

      const result = isTestCreationAllowed(freeSub, lastTestDate);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('limit_reached');
    });

    it('allows test if last test was >= 7 days ago', () => {
      const lastTestDate = new Date(today);
      lastTestDate.setDate(today.getDate() - 7);

      const result = isTestCreationAllowed(freeSub, lastTestDate);
      expect(result.allowed).toBe(true);
    });
  });
});
