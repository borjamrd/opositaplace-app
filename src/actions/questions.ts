'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function reportQuestion(questionId: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthenticated' };
    }

    const { error } = await supabase.from('question_reports').insert({
      question_id: questionId,
      user_id: user.id,
      status: 'pending',
    });

    if (error) {
      console.error('Error reporting question:', error);
      return { success: false, error: 'Failed to report question' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
