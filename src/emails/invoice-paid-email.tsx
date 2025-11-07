// src/emails/invoice-paid-email.tsx
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

interface InvoicePaidEmailProps {
  userName?: string;
  invoiceUrl?: string; // Enlace al PDF de la factura
}

const isPreview = process.env.NODE_ENV === 'development';
const baseUrl = isPreview ? '' : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const logoSrc = isPreview
  ? '/static/opositaplace_logo_v1.png'
  : `${baseUrl}/opositaplace_logo_v1.png`;

export const InvoicePaidEmail = ({ userName = 'Opositor', invoiceUrl }: InvoicePaidEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu factura de Opositaplace</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={logoSrc} width="120" alt="Opositaplace Logo" style={logo} />
          <Heading style={heading}>Aquí tienes tu factura</Heading>
          <Text style={paragraph}>Hola {userName},</Text>
          <Text style={paragraph}>
            Te adjuntamos la factura de tu suscripción a Opositaplace.
          </Text>
          {invoiceUrl && (
            <Section style={btnContainer}>
              <Button style={button} href={invoiceUrl}>
                Descargar Factura (PDF)
              </Button>
            </Section>
          )}
          <Text style={paragraph}>
            Gracias por seguir confiando en nosotros.
            <br />- El equipo de Opositaplace
          </Text>
          {/* ... (estilos y footer) ... */}
        </Container>
      </Body>
    </Html>
  );
};
// ... (estilos y PreviewProps)
export default InvoicePaidEmail;

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
  backgroundColor: '#4C6EF5',
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
