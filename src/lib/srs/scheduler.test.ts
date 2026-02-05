import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './scheduler';

describe('calculateNextReview', () => {
  it('resets interval on "again" rating', () => {
    const result = calculateNextReview(10, 2.5, 'again');
    expect(result.newInterval).toBe(1);
    expect(result.newEaseFactor).toBeLessThan(2.5); // Should decrease
  });

  it('increases interval moderately on "hard" rating', () => {
    const result = calculateNextReview(10, 2.5, 'hard');
    expect(result.newInterval).toBe(12); // 10 * 1.2
    expect(result.newEaseFactor).toBeLessThan(2.5);
  });

  it('increases interval normally on "good" rating', () => {
    const result = calculateNextReview(10, 2.5, 'good');
    expect(result.newInterval).toBe(25); // 10 * 2.5
    expect(result.newEaseFactor).toBe(2.5); // Stays same
  });

  it('increases interval aggressively on "easy" rating', () => {
    const result = calculateNextReview(10, 2.5, 'easy');
    expect(result.newInterval).toBe(33); // 10 * 2.5 * 1.3 = 32.5 -> 33
    expect(result.newEaseFactor).toBeGreaterThan(2.5);
  });

  it('ensures interval increases by at least 1 day for non-fail ratings', () => {
    // If interval is small, multiplication might result in same number
    const result = calculateNextReview(1, 1.3, 'good');
    // 1 * 1.3 = 1.3 -> round to 1.
    // Logic should force it to 2.
    expect(result.newInterval).toBeGreaterThan(1);
  });

  it('respects minimum ease factor', () => {
    const result = calculateNextReview(10, 1.3, 'again'); // 1.3 - 0.2 = 1.1 < 1.3
    expect(result.newEaseFactor).toBe(1.3);
  });
});
