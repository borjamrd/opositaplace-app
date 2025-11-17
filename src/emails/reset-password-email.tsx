// src/emails/reset-password-email.tsx
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

interface ResetPasswordEmailProps {
  userName?: string;
  resetLink?: string;
}

const isPreview = process.env.NODE_ENV === 'development';
const baseUrl = isPreview ? '' : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const logoSrc = isPreview
  ? '/static/opositaplace_logo_v1.png'
  : `${baseUrl}/opositaplace_logo_v1.png`;

export const ResetPasswordEmail = ({
  userName = 'Opositor',
  resetLink = 'http://localhost:3000/auth/reset-password',
}: ResetPasswordEmailProps) => {
  const previewText = `Restablece tu contraseña de Opositaplace`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={logoSrc} width="120" alt="Opositaplace Logo" style={logo} />
          <Heading style={heading}>Restablece tu contraseña</Heading>
          <Text style={paragraph}>Hola {userName},</Text>
          <Text style={paragraph}>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de
            Opositaplace.
          </Text>
          <Text style={paragraph}>
            Haz clic en el botón de abajo para establecer una nueva contraseña. Este enlace es
            válido durante 1 hora.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={resetLink}>
              Restablecer Contraseña
            </Button>
          </Section>
          <Text style={paragraph}>
            Si no has solicitado este cambio, puedes ignorar este correo sin problemas.
          </Text>
          <Text style={paragraph}>
            Un saludo,
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

// Añadimos props por defecto para el servidor de previsualización
ResetPasswordEmail.PreviewProps = {
  userName: 'Opositor',
  resetLink: 'http://localhost:3000',
};

export default ResetPasswordEmail;

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
