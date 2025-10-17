// src/lib/tests/question-logic.test.ts

import { shuffle } from '../utils';

describe('Lógica de Selección de Preguntas', () => {
  it('shuffleArray debería reordenar un array', () => {
    const originalArray = [1, 2, 3, 4, 5];
    const shuffled = shuffle([...originalArray]);

    expect(shuffled).toHaveLength(originalArray.length);
    expect(shuffled).toEqual(expect.arrayContaining(originalArray));
  });
});
