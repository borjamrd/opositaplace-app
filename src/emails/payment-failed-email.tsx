import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';

interface PaymentFailedEmailProps {
  userName?: string;
  portalLink?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// En lugar de pasar un 'portalLink', enlazamos a la página de perfil.
// Esta página (ej. /dashboard/profile) debería tener un botón
// que llame a tu API '/api/stripe/create-portal-link' para
// redirigir al usuario al portal de Stripe.
const profileUrl = `${baseUrl}/dashboard/profile`;

export const PaymentFailedEmail = ({ userName = 'Opositor' }: PaymentFailedEmailProps) => {
  const previewText = `Acción requerida: tu pago de Opositaplace ha fallado`;

  return (
    <EmailLayout previewText={previewText}>
      <Heading style={heading}>Acción Requerida</Heading>
      <Text style={paragraph}>Hola {userName},</Text>
      <Text style={paragraph}>
        Hemos intentado renovar tu suscripción de Opositaplace, pero el pago ha fallado.
      </Text>
      <Text style={paragraph}>
        Para evitar la interrupción del servicio, por favor, actualiza tu método de pago lo antes
        posible. Puedes hacerlo desde tu panel de suscripción.
      </Text>
      <Section style={btnContainer}>
        <Button style={button} href={profileUrl}>
          Actualizar método de pago
        </Button>
      </Section>
      <Text style={paragraph}>
        Stripe volverá a intentar el cobro automáticamente. Si tu método de pago está actualizado,
        no necesitas hacer nada más.
      </Text>
      <Text style={paragraph}>
        Gracias,
        <br />- El equipo de Opositaplace
      </Text>
    </EmailLayout>
  );
};

PaymentFailedEmail.PreviewProps = {
  userName: 'Opositor',
};

export default PaymentFailedEmail;
