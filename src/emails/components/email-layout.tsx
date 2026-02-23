import { Body, Container, Head, Hr, Html, Img, Preview, Text } from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

const isPreview = process.env.NODE_ENV === 'development';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const logoSrc = isPreview ? '/static/logo.png' : `${baseUrl}/logo.png`;

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={logoSrc} width="80" height="auto" alt="Opositaplace Logo" style={logo} />
          {children}
          <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
          <Container
            style={{
              padding: '0 40px',
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Text style={notificationFooter}>
              Recuerda que puedes modificar todas estas notificaciones desde el apartado de perfil{' '}
              {'>'} notificaciones.
            </Text>
            <Text style={footer}>
              © {new Date().getFullYear()} Opositaplace. Todos los derechos reservados.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
};

// Shared Styles
export const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

export const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

export const logo = {
  margin: '0 auto',
};

export const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '32px',
  textAlign: 'center' as const,
  color: '#14213D',
};

export const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
  padding: '0 40px',
};

export const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

export const button = {
  backgroundColor: '#000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

export const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

export const notificationFooter = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '0px',
  textAlign: 'center' as const,
};
