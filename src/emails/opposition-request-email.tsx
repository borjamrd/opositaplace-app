import { Button, Heading, Text } from '@react-email/components';
import { btnContainer, button, EmailLayout, heading, paragraph } from './components/email-layout';

interface OppositionRequestEmailProps {
  oppositionName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const OppositionRequestEmail = ({
  oppositionName = 'Gestión de la Administración Civil del Estado',
}: OppositionRequestEmailProps) => {
  return (
    <EmailLayout previewText={`Solicitud recibida: ${oppositionName}`}>
      <Heading style={heading}>¡Solicitud recibida!</Heading>
      <Text style={paragraph}>Hola,</Text>
      <Text style={paragraph}>
        Hemos recibido tu interés en la oposición de <strong>{oppositionName}</strong>.
      </Text>
      <Text style={paragraph}>
        Actualmente estamos trabajando en ampliar nuestro catálogo. Hemos registrado tu solicitud y
        te avisaremos por correo electrónico en cuanto esta oposición esté disponible en
        Opositaplace.
      </Text>
      <Text style={paragraph}>
        Mientras tanto, puedes explorar las oposiciones que ya tenemos disponibles.
      </Text>

      <div style={btnContainer}>
        <Button style={button} href={`${baseUrl}`}>
          Ir a Opositaplace
        </Button>
      </div>

      <Text style={paragraph}>Muchas gracias por tu interés y confianza en nosotros.</Text>
    </EmailLayout>
  );
};

export default OppositionRequestEmail;
