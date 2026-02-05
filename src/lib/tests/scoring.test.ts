import { describe, it, expect } from 'vitest';
import { calculateTestScore } from './scoring';

describe('calculateTestScore', () => {
  const questions = [
    {
      id: 'q1',
      answers: [
        { id: 'a1_correct', is_correct: true },
        { id: 'a1_wrong', is_correct: false },
      ],
    },
    {
      id: 'q2',
      answers: [
        { id: 'a2_correct', is_correct: true },
        { id: 'a2_wrong', is_correct: false },
      ],
    },
    {
      id: 'q3',
      answers: [
        { id: 'a3_correct', is_correct: true },
        { id: 'a3_wrong', is_correct: false },
      ],
    },
  ];

  it('calculates perfect score correctly', () => {
    const userAnswers = {
      q1: 'a1_correct',
      q2: 'a2_correct',
      q3: 'a3_correct',
    };
    const result = calculateTestScore(questions, userAnswers);
    expect(result.correctCount).toBe(3);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(0);
    expect(result.finalScore).toBe(10);
  });

  it('calculates score with incorrect answers (penalization)', () => {
    const userAnswers = {
      q1: 'a1_correct',
      q2: 'a2_correct',
      q3: 'a3_wrong', // -0.33
    };
    const result = calculateTestScore(questions, userAnswers);
    expect(result.correctCount).toBe(2);
    expect(result.incorrectCount).toBe(1);
    expect(result.unansweredCount).toBe(0);

    // Net points = 2 - (1/3) = 1.666...
    // Final score = (1.666... / 3) * 10 = ~5.555... -> 5.56
    expect(result.netPoints).toBeCloseTo(1.666, 2);
    expect(result.finalScore).toBeCloseTo(5.56, 2);
  });

  it('handles unanswered questions (no penalty)', () => {
    const userAnswers = {
      q1: 'a1_correct',
    };
    const result = calculateTestScore(questions, userAnswers);
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(2);

    // Net points = 1
    // Final score = (1 / 3) * 10 = 3.33
    expect(result.finalScore).toBeCloseTo(3.33, 2);
  });

  it('ensures score is not negative', () => {
    const userAnswers = {
      q1: 'a1_wrong',
      q2: 'a2_wrong',
      q3: 'a3_wrong',
    };
    const result = calculateTestScore(questions, userAnswers);
    expect(result.incorrectCount).toBe(3);
    expect(result.netPoints).toBe(0); // Should be capped at 0
    expect(result.finalScore).toBe(0);
  });
});
