// src/lib/supabase/types.ts

import { Tables } from '@/lib/supabase/database.types';

export type Profile = Tables<'profiles'>;
export type UserStudySession = Tables<'user_study_sessions'>;
export type Question = Tables<'questions'>;
export type Answer = Tables<'answers'>;

export type SelectiveProcess = Tables<'selective_processes'>;
export type ProcessStage = Tables<'process_stages'>;
export type UserProcessStatus = Tables<'user_process_status'>;

//**
// Tipo combinado para devolver toda la información del proceso del usuario
/*
 */
export type FullUserProcess = {
  process: SelectiveProcess;
  stages: ProcessStage[];
  userStatus: UserProcessStatus | null;
};
