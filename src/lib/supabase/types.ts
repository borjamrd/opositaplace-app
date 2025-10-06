// src/lib/supabase/types.ts

import { Database } from '@/lib/database.types';

export type User = Database['public']['Tables']['profiles']['Row'];
export type UserStudySession = Database['public']['Tables']['user_study_sessions']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type Answer = Database['public']['Tables']['answers']['Row'];

export type SelectiveProcess = Database['public']['Tables']['selective_processes']['Row'];
export type ProcessStage = Database['public']['Tables']['process_stages']['Row'];
export type UserProcessStatus = Database['public']['Tables']['user_process_status']['Row'];

// Tipo combinado para devolver toda la información del proceso del usuario
export type FullUserProcess = {
  process: SelectiveProcess;
  stages: ProcessStage[];
  userStatus: UserProcessStatus | null;
};