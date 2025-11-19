// src/lib/supabase/types.ts

import { Tables, Enums, TablesInsert } from '@/lib/supabase/database.types';
export type { Json } from '@/lib/supabase/database.types';

export type Opposition = Tables<'oppositions'>;
export type Profile = Tables<'profiles'>;
export type TestAttempt = Tables<'test_attempts'>;
export type UserStudySession = Tables<'user_study_sessions'>;
export type Question = Tables<'questions'>;
export type StudyCycle = Tables<'user_study_cycles'>;

export type Answer = Tables<'answers'>;
export type Subscription = Tables<'user_subscriptions'>;
export type InsertSubscription = TablesInsert<'user_subscriptions'>;

export type SelectiveProcess = Tables<'selective_processes'>;
export type ProcessStage = Tables<'process_stages'>;
export type UserProcessStatus = Tables<'user_process_status'>;
export type ProfileSettings = Tables<'profiles'>;
export type OnboardingInfo = Tables<'onboarding_info'>;
export type SrsCard = Tables<'srs_cards'>;
export type SyllabusStatus = Enums<'syllabus_status'>;
export type Block = Tables<'blocks'>;
export type Topic = Tables<'topics'>;

export type ProfileWithOnboarding = Profile & {
  onboarding?: OnboardingInfo | null;
};

export interface UserSessionData {
  profile: ProfileWithOnboarding | null;
  subscription: Subscription | null;
  userOppositions: Opposition[];
  activeOpposition: Opposition | null;
  studyCycles: StudyCycle[];
  activeStudyCycle: StudyCycle | null;
}

//**
/* Tipo combinado para devolver una pregunta con sus respuestas
 */
export type QuestionWithAnswers = Tables<'questions'> & {
  answers: Tables<'answers'>[];
};

export type QuestionForSession = Tables<'questions'> & {
  answers: Tables<'answers'>[];
  topic:
    | (Tables<'topics'> & {
        block: Tables<'blocks'> | null;
      })
    | null;
};

//**
/* Tipo combinado para devolver toda la información del proceso del usuario
 */
export type FullUserProcess = {
  process: SelectiveProcess;
  stages: ProcessStage[];
  userStatus: UserProcessStatus | null;
};
