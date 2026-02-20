import { Heading, Hr, Link, Section, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './components/email-layout';

// Define las props que recibirá tu email
interface StudyReminderEmailProps {
  userName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const StudyReminderEmail = ({ userName }: StudyReminderEmailProps) => (
  <EmailLayout previewText="¿Echamos un rato de estudio en Opositaplace?">
    <Heading style={heading}>¡Hola, {userName || 'Opositor'}!</Heading>

    <Text style={paragraph}>
      Te echamos de menos por Opositaplace. Hace unos días que no registras actividad y queremos
      animarte a retomar el ritmo.
    </Text>

    <Text style={paragraph}>
      Recuerda que la constancia es clave en la preparación. ¡Aunque sea un ratito, todo suma!
    </Text>

    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
      <Link href={baseUrl} style={button}>
        Retomar mi estudio
      </Link>
    </Section>

    <Text style={paragraph}>
      ¡Ánimo con el estudio!
      <br />
      El equipo de Opositaplace
    </Text>
  </EmailLayout>
);

export default StudyReminderEmail;
