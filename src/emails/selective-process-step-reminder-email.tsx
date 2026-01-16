import { Heading, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph } from './components/email-layout';

interface SelectiveProcessStepReminderEmailProps {
  userName: string;
  processName: string;
  stageName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const SelectiveProcessStepReminderEmail = ({
  userName,
  processName,
  stageName,
}: SelectiveProcessStepReminderEmailProps) => {
  return (
    <EmailLayout previewText={`La fase ${stageName} finaliza hoy`}>
      <Heading style={heading}>¡Atención, {userName || 'Opositor'}!</Heading>

      <Text style={paragraph}>
        Te recordamos que hoy es la fecha clave para la fase <strong>{stageName}</strong> del
        proceso selectivo: <strong>{processName}</strong>.
      </Text>

      <Text style={paragraph}>
        Si aún no has completado los trámites necesarios o no te has preparado conforme a tu plan,
        ¡es el momento!
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href={`${baseUrl}/dashboard/timeline`} style={button}>
          Ver mi proceso selectivo
        </Link>
      </Section>
    </EmailLayout>
  );
};

export default SelectiveProcessStepReminderEmail;
