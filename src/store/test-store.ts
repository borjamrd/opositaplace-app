// src/store/test-store.ts
import { Answer, Question, Test } from '@/lib/supabase/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { Answer, Question, Test } from '@/lib/database.types';

export type TestState = {
  test: Test | null;
  questions: Question[];
  answers: Answer[];
  userAnswers: Map<string, string | null>;
  currentQuestionIndex: number;
  isFinished: boolean;
  setTest: (test: Test, questions: Question[], answers: Answer[]) => void;
  setUserAnswer: (questionId: string, answerId: string | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  finishTest: () => void;
  reset: () => void;
};

// Mapa para evitar problemas de persistencia en el servidor
const storage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const { state } = JSON.parse(str);
    return {
      state: {
        ...state,
        userAnswers: new Map(Object.entries(state.userAnswers)),
      },
    };
  },
  setItem: (name: string, newValue: any) => {
    const str = JSON.stringify({
      state: {
        ...newValue.state,
        userAnswers: Object.fromEntries(newValue.state.userAnswers),
      },
    });
    localStorage.setItem(name, str);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      test: null,
      questions: [],
      answers: [],
      userAnswers: new Map(),
      currentQuestionIndex: 0,
      isFinished: false,
      setTest: (test, questions, answers) => {
        const userAnswers = new Map<string, string | null>();
        questions.forEach((q) => userAnswers.set(q.id, null));
        set({
          test,
          questions,
          answers,
          userAnswers,
          currentQuestionIndex: 0,
          isFinished: false,
        });
      },
      setUserAnswer: (questionId, answerId) => {
        set((state) => {
          const newAnswers = new Map(state.userAnswers);
          newAnswers.set(questionId, answerId);
          return { userAnswers: newAnswers };
        });
      },
      setCurrentQuestionIndex: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentQuestionIndex: index });
        }
      },
      finishTest: () => set({ isFinished: true }),
      reset: () => {
        set({
          test: null,
          questions: [],
          answers: [],
          userAnswers: new Map(),
          currentQuestionIndex: 0,
          isFinished: false,
        });
      },
    }),
    {
      name: 'test-storage',
      storage,
    }
  )
);
