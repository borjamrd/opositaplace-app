interface Question {
  id: string;
  answers: {
    id: string;
    is_correct: boolean;
  }[];
}

interface TestScoreResult {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  netPoints: number;
  finalScore: number;
  answersToUpsert: {
    question_id: string;
    selected_answer_id: string | null;
    is_correct: boolean;
    status: 'correct' | 'incorrect' | 'blank';
  }[];
}

export function calculateTestScore(
  questions: Question[],
  userAnswers: Record<string, string | null>
): TestScoreResult {
  let correctCount = 0;
  let incorrectCount = 0;
  const answersToUpsert = [];

  for (const question of questions) {
    const userAnswerId = userAnswers[question.id] || null;
    let isCorrect = false;
    let status: 'correct' | 'incorrect' | 'blank' = 'blank';

    if (userAnswerId) {
      isCorrect = question.answers.some((a) => a.id === userAnswerId && a.is_correct);
      if (isCorrect) {
        correctCount++;
        status = 'correct';
      } else {
        incorrectCount++;
        status = 'incorrect';
      }
    }

    answersToUpsert.push({
      question_id: question.id,
      selected_answer_id: userAnswerId,
      is_correct: isCorrect,
      status: status,
    });
  }

  const unansweredCount = questions.length - (correctCount + incorrectCount);

  // Scoring formula: Correct - Incorrect/3
  const rawNetPoints = correctCount - incorrectCount / 3;

  // Ensure non-negative net points
  const netPoints = Math.max(0, rawNetPoints);

  // Scale to 0-10
  const finalScore = questions.length > 0 ? (netPoints / questions.length) * 10 : 0;

  return {
    correctCount,
    incorrectCount,
    unansweredCount,
    netPoints,
    finalScore,
    answersToUpsert,
  };
}
