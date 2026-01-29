import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';
import { TRIAL_DAYS } from '@/lib/constants';

interface WelcomeEmailProps {
  userName?: string;
  dashboardUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const WelcomeEmail = ({
  userName = 'Opositor',
  dashboardUrl = '/dashboard',
}: WelcomeEmailProps) => {
  const previewText = `¡Bienvenido a Opositaplace, ${userName}!`;

  return (
    <EmailLayout previewText={previewText}>
      <Heading style={heading}>¡Te damos la bienvenida a Opositaplace!</Heading>
      <Text style={paragraph}>Hola {userName},</Text>
      <Text style={paragraph}>
        Estamos encantados de tenerte a bordo. Puedes empezar explorando tu panel de control,
        configurando tus temas, realizando tu primer test o preparando tu primer caso práctico.
      </Text>

      <Text style={paragraph}>
        Si durante el onboarding escogiste la versión de prueba, recuerda que tienes {TRIAL_DAYS}{' '}
        días gratis para probar la mejor versión de Opositaplace. No te preocupes, no se te cobrará
        nada al finalizar y se te pasará a la versión gratuita automáticamente. Puedes cambiarla
        cuando quieras. En caso de que optases por la versión gratuita, esta se mantendrá activa
        hasta que decidas actualizarla.
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
    </EmailLayout>
  );
};

WelcomeEmail.PreviewProps = {
  userName: 'Opositor',
  dashboardUrl: '/dashboard',
};

export default WelcomeEmail;
