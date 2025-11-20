import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';

interface ResetPasswordEmailProps {
  userName?: string;
  resetLink?: string;
}

export const ResetPasswordEmail = ({
  userName = 'Opositor',
  resetLink = 'http://localhost:3000/auth/reset-password',
}: ResetPasswordEmailProps) => {
  const previewText = `Restablece tu contraseña de Opositaplace`;

  return (
    <EmailLayout previewText={previewText}>
      <Heading style={heading}>Restablece tu contraseña</Heading>
      <Text style={paragraph}>Hola {userName},</Text>
      <Text style={paragraph}>
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Opositaplace.
      </Text>
      <Text style={paragraph}>
        Haz clic en el botón de abajo para establecer una nueva contraseña. Este enlace es válido
        durante 1 hora.
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
    </EmailLayout>
  );
};

// Añadimos props por defecto para el servidor de previsualización
ResetPasswordEmail.PreviewProps = {
  userName: 'Opositor',
  resetLink: 'http://localhost:3000',
};

export default ResetPasswordEmail;
