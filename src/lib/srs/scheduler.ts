const MIN_EASE_FACTOR = 1.3;

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCalculationResult {
  newInterval: number;
  newEaseFactor: number;
}

export function calculateNextReview(
  currentInterval: number,
  currentEaseFactor: number,
  rating: ReviewRating
): SrsCalculationResult {
  let newInterval: number;
  let newEaseFactor = currentEaseFactor;

  switch (rating) {
    case 'again':
      newInterval = 1;
      newEaseFactor = Math.max(currentEaseFactor - 0.2, MIN_EASE_FACTOR);
      break;
    case 'hard':
      newInterval = Math.round(currentInterval * 1.2);
      newEaseFactor = Math.max(currentEaseFactor - 0.15, MIN_EASE_FACTOR);
      break;
    case 'good':
      newInterval = Math.round(currentInterval * currentEaseFactor);
      break;
    case 'easy':
    default:
      newInterval = Math.round(currentInterval * currentEaseFactor * 1.3);
      newEaseFactor = currentEaseFactor + 0.15;
      break;
  }

  // Prevent 'hard' and 'good' from resulting in the same interval if not 'again'
  if (rating !== 'again' && newInterval <= currentInterval) {
    // original logic was: if (rating !== 'again' && newInterval === card.current_interval) newInterval += 1;
    // generally we want it to increase at least by 1 if it wasn't a failure
    if (newInterval === currentInterval) {
      newInterval += 1;
    }
  }

  return {
    newInterval,
    newEaseFactor,
  };
}
