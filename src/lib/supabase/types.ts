// src/lib/supabase/types.ts

import { Database } from '@/lib/database.types';

export type User = Database['public']['Tables']['profiles']['Row'];
export type UserStudySession = Database['public']['Tables']['user_study_sessions']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type Test = Database['public']['Tables']['tests']['Row'];
export type Answer = Database['public']['Tables']['answers']['Row'];