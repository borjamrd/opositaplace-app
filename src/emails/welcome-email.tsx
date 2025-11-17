// src/emails/welcome-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName?: string;
  dashboardUrl?: string;
}

const isPreview = process.env.NODE_ENV === 'development';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// logoSrc cambiará según el entorno
const logoSrc = isPreview
  ? '/static/opositaplace_logo_v1.png'
  : `${baseUrl}/opositaplace_logo_v1.png`;

export const WelcomeEmail = ({
  userName = 'Opositor',
  dashboardUrl = '/dashboard',
}: WelcomeEmailProps) => {
  const previewText = `¡Bienvenido a Opositaplace, ${userName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={logoSrc} // <-- Lógica de ruta actualizada
            width="120"
            height="auto"
            alt="Opositaplace Logo"
            style={logo}
          />
          <Heading style={heading}>¡Te damos la bienvenida a Opositaplace!</Heading>
          <Text style={paragraph}>Hola {userName},</Text>
          <Text style={paragraph}>
            Estamos encantados de tenerte a bordo. Opositaplace es tu centro de mandos para
            conquistar tu oposición.
          </Text>
          <Text style={paragraph}>
            Puedes empezar explorando tu panel de control, configurando tus temas o realizando tu
            primer test.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={`${baseUrl}${dashboardUrl}`}>
              Ir a mi Panel
            </Button>
          </Section>
          <Text style={paragraph}>Si tienes cualquier duda, no dudes en contactarnos.</Text>
          <Text style={paragraph}>
            ¡Mucho ánimo y a por tu plaza!
            <br />- El equipo de Opositaplace
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} Opositaplace. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  userName: 'Opositor',
  dashboardUrl: '/dashboard',
};

export default WelcomeEmail;

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
