import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import {
  EmailLayout,
  btnContainer,
  button,
  footer,
  heading,
  paragraph,
} from './components/email-layout';
import { TRIAL_DAYS } from '@/lib/constants';

interface TrialEndedEmailProps {
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const TrialEndedEmail = ({ userName }: TrialEndedEmailProps) => {
  const previewText = 'Tu período de prueba de Opositaplace ha terminado.';

  return (
    <EmailLayout previewText={previewText}>
      <Heading style={heading}>Tu período de prueba ha finalizado</Heading>
      <Text style={paragraph}>Hola{userName ? ` ${userName}` : ''},</Text>
      <Text style={paragraph}>
        Tu período de prueba gratuito de {TRIAL_DAYS} días del plan premium ha terminado. Como no se
        añadió un método de pago, tu cuenta ha sido movida automáticamente al plan gratuito.
      </Text>
      <Text style={paragraph}>
        ¡No te preocupes! Aún tienes acceso completo a las funciones básicas de Opositaplace y todo
        tu progreso sigue guardado.
      </Text>
      <Text style={paragraph}>
        Si quieres volver a disfrutar de todas las funciones premium (como el estudio inteligente
        SRS, tests ilimitados y el asistente IA), puedes actualizar tu plan en cualquier momento.
      </Text>
      <Section style={btnContainer}>
        <Button
          style={button}
          href={`${baseUrl}/dashboard/profile`} // Los usuarios pueden gestionar su plan desde el perfil
        >
          Ver planes
        </Button>
      </Section>
      <Text style={paragraph}>
        Un saludo,
        <br />
        El equipo de Opositaplace
      </Text>
      <Hr style={hr} />
      <Text style={footer}>Opositaplace - Tu compañero de estudio inteligente</Text>
    </EmailLayout>
  );
};

export default TrialEndedEmail;

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};
