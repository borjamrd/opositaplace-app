import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface TrialEndedEmailProps {
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const logoUrl = `${baseUrl}/static/opositaplace_logo_v1.png`;

export const TrialEndedEmail = ({ userName }: TrialEndedEmailProps) => {
  const previewText = 'Tu período de prueba de Opositaplace ha terminado.';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src={logoUrl} width="180" height="40" alt="Opositaplace" />
          </Section>
          <Heading style={h1}>Tu período de prueba ha finalizado</Heading>
          <Text style={text}>Hola{userName ? ` ${userName}` : ''},</Text>
          <Text style={text}>
            Tu período de prueba gratuito de 7 días del plan premium ha terminado. Como no se añadió
            un método de pago, tu cuenta ha sido movida automáticamente al plan gratuito.
          </Text>
          <Text style={text}>
            ¡No te preocupes! Aún tienes acceso completo a las funciones básicas de Opositaplace y
            todo tu progreso sigue guardado.
          </Text>
          <Text style={text}>
            Si quieres volver a disfrutar de todas las funciones premium (como el estudio
            inteligente SRS, tests ilimitados y el asistente IA), puedes actualizar tu plan en
            cualquier momento.
          </Text>
          <Section style={btnContainer}>
            <Button
              style={button}
              href={`${baseUrl}/dashboard/profile`} // Los usuarios pueden gestionar su plan desde el perfil
            >
              Ver planes
            </Button>
          </Section>
          <Text style={text}>
            Un saludo,
            <br />
            El equipo de Opositaplace
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Opositaplace - Tu compañero de estudio inteligente</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TrialEndedEmail;

// --- Estilos ---
// (Copiados de tus otros emails para consistencia)

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

const logoContainer = {
  padding: '0 40px',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
};
