'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateOppositionRequestSchema = z.object({
  email: z.string().email(),
  oppositionName: z.string().min(1, 'El nombre de la oposición es obligatorio'),
});

export type CreateOppositionRequestState = {
  success?: boolean;
  error?: string;
};

export async function createOppositionRequest(
  prevState: CreateOppositionRequestState | null,
  formData: FormData
): Promise<CreateOppositionRequestState> {
  const validatedFields = CreateOppositionRequestSchema.safeParse({
    email: formData.get('email'),
    oppositionName: formData.get('oppositionName'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos inválidos. Por favor, revisa los campos.',
    };
  }

  const { email, oppositionName } = validatedFields.data;
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from('opposition_requests').insert({
      email,
      opposition_name: oppositionName,
    });

    if (error) {
      console.error('Error creating opposition request:', error);
      return {
        success: false,
        error: 'Error al enviar la solicitud. Inténtalo de nuevo más tarde.',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'Ocurrió un error inesperado.',
    };
  }
}
