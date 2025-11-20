import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';

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
        Estamos encantados de tenerte a bordo. Opositaplace es tu centro de mandos para conquistar
        tu oposición.
      </Text>
      <Text style={paragraph}>
        Puedes empezar explorando tu panel de control, configurando tus temas o realizando tu primer
        test.
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
