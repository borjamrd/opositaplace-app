// src/emails/payment-failed-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PaymentFailedEmailProps {
  userName?: string;
  portalLink?: string;
}

const isPreview = process.env.NODE_ENV === 'development';
const baseUrl = isPreview
  ? ''
  : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const logoSrc = isPreview
  ? '/static/opositaplace_logo_v1.png'
  : `${baseUrl}/opositaplace_logo_v1.png`;

// En lugar de pasar un 'portalLink', enlazamos a la página de perfil.
// Esta página (ej. /dashboard/profile) debería tener un botón
// que llame a tu API '/api/stripe/create-portal-link' para
// redirigir al usuario al portal de Stripe.
const profileUrl = `${baseUrl}/dashboard/profile`;

export const PaymentFailedEmail = ({
  userName = 'Opositor',
}: PaymentFailedEmailProps) => {
  const previewText = `Acción requerida: tu pago de Opositaplace ha fallado`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={logoSrc} width="120" alt="Opositaplace Logo" style={logo} />
          <Heading style={heading}>Acción Requerida</Heading>
          <Text style={paragraph}>Hola {userName},</Text>
          <Text style={paragraph}>
            Hemos intentado renovar tu suscripción de Opositaplace, pero el
            pago ha fallado.
          </Text>
          <Text style={paragraph}>
            Para evitar la interrupción del servicio, por favor, actualiza tu
            método de pago lo antes posible. Puedes hacerlo desde tu panel de
            suscripción.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={profileUrl}>
              Actualizar método de pago
            </Button>
          </Section>
          <Text style={paragraph}>
            Stripe volverá a intentar el cobro automáticamente. Si tu método de
            pago está actualizado, no necesitas hacer nada más.
          </Text>
          <Text style={paragraph}>
            Gracias,
            <br />- El equipo de Opositaplace
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} Opositaplace. Todos los derechos
            reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PaymentFailedEmail.PreviewProps = {
  userName: 'Opositor',
};

export default PaymentFailedEmail;

// --- Estilos (reutilizamos los mismos) ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};
const logo = {
  margin: '0 auto',
};
const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '32px',
  textAlign: 'center' as const,
  color: '#14213D',
};
const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
  padding: '0 40px',
};
const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};
const button = {
  backgroundColor: '#DB7072', // <-- Usamos tu color "Danger"
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};
const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '24px',
};