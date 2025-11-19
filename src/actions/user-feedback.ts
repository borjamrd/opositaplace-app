'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import SupportTicketEmail from '@/emails/support-ticket-email';
const resend = new Resend(process.env.RESEND_API_KEY);

const feedbackSchema = z.object({
  idea: z.string().min(5, 'Cuéntanos un poco más (mínimo 5 caracteres)'),
});

const supportTicketSchema = z.object({
  subject: z.string().min(1, 'El asunto es obligatorio'),
  description: z.string().min(10, 'Detalla un poco más el problema (mínimo 10 caracteres)'),
  attachmentUrl: z.string().optional().nullable(),
});
export async function submitQuickFeedback(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Debes iniciar sesión' };

  const idea = formData.get('idea') as string;
  const validation = feedbackSchema.safeParse({ idea });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { error } = await supabase.from('feedback').insert({
    comment: `[Usuario: ${user.email}] ${idea}`,
    user_id: user.id,
  });

  if (error) {
    console.error('Error guardando feedback:', error);
    return { error: 'Error al guardar tu idea. Inténtalo de nuevo.' };
  }

  return { success: true };
}

export async function submitSupportTicket(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'Sesión expirada' };

  const rawData = {
    subject: formData.get('subject') as string,
    description: formData.get('description') as string,
    attachmentUrl: formData.get('attachmentUrl') as string,
  };

  const validation = supportTicketSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }

  const { subject, description, attachmentUrl } = validation.data;

  try {
    await resend.emails.send({
      from: 'Opositaplace Support <soporte@opositaplace.es>',
      to: ['opositaplace@gmail.com'],
      subject: `[Soporte] ${subject}`,
      replyTo: user.email || undefined,
      react: SupportTicketEmail({
        userEmail: user.email || 'Desconocido',
        userId: user.id,
        subject,
        description,
        attachmentUrl,
      }),
    });

    return { success: true, message: 'Ticket enviado correctamente' };
  } catch (error) {
    console.error('Error enviando ticket:', error);
    return { success: false, message: 'Error al enviar el ticket' };
  }
}
