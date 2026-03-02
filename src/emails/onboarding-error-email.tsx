import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';
import * as React from 'react';

interface OnboardingErrorEmailProps {
  userName?: string;
  errorStep?: string;
  supportUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const OnboardingErrorEmail = ({
  userName = 'Opositor',
  errorStep = 'configuración inicial',
  supportUrl = '/contacto',
}: OnboardingErrorEmailProps) => {
  const previewText = 'Tuvimos un problema durante tu registro en Opositaplace';

  return (
    <EmailLayout previewText={previewText}>
      <Heading style={heading}>Algo fue mal durante tu registro</Heading>
      <Text style={paragraph}>Hola {userName},</Text>
      <Text style={paragraph}>
        Hemos detectado un problema al completar tu proceso de configuración (paso:{' '}
        <strong>{errorStep}</strong>).
      </Text>
      <Text style={paragraph}>
        Nuestro equipo ya ha sido notificado y trabajará para solucionarlo lo antes posible. Si el
        problema persiste, no dudes en contactarnos directamente.
      </Text>
      <Section style={btnContainer}>
        <Button style={button} href={`${baseUrl}${supportUrl}`}>
          Contactar con soporte
        </Button>
      </Section>
      <Text style={paragraph}>
        Disculpa las molestias.
        <br />- El equipo de Opositaplace
      </Text>
    </EmailLayout>
  );
};

OnboardingErrorEmail.PreviewProps = {
  userName: 'Opositor',
  errorStep: 'asociar oposición',
  supportUrl: '/contacto',
};

export default OnboardingErrorEmail;
