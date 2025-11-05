// src/lib/email.ts
import { Resend } from 'resend';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM;

export async function sendEmail({
  to,
  subject,
  emailComponent, 
}: {
  to: string;
  subject: string;
  emailComponent: React.ReactElement;
}) {
  if (!fromEmail) {
    throw new Error(
      'La variable de entorno EMAIL_FROM no está configurada.'
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      react: emailComponent,
    });

    if (error) {
      console.error('Error al enviar email con Resend:', error);
      throw new Error('Error al enviar el correo.');
    }

    return data;
  } catch (exception) {
    console.error('Excepción al enviar email:', exception);
    throw new Error('Error al procesar el envío del correo.');
  }
}