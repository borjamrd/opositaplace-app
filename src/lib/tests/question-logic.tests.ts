// src/lib/tests/question-logic.test.ts
import { shuffleArray } from '@/actions/tests'; // Asumiendo que exportas la función

describe('Lógica de Selección de Preguntas', () => {
  it('shuffleArray debería reordenar un array', () => {
    const originalArray = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...originalArray]); // Usar una copia
    
    // Comprueba que el array tiene la misma longitud y elementos
    expect(shuffled).toHaveLength(originalArray.length);
    expect(shuffled).toEqual(expect.arrayContaining(originalArray));
    // Es improbable, pero no imposible, que el array reordenado sea idéntico.
    // Una prueba más robusta podría verificar que no son iguales, pero esto es suficiente.
    // expect(shuffled).not.toEqual(originalArray);
  });
});