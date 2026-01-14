import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, btnContainer, paragraph, heading } from './components/email-layout';

interface CorrectionCompletedEmailProps {
  caseId: string;
  caseTitle?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const CorrectionCompletedEmail = ({ caseId, caseTitle }: CorrectionCompletedEmailProps) => {
  const caseLink = `${baseUrl}/dashboard/practical-cases/${caseId}`;

  return (
    <EmailLayout previewText="Tu corrección está lista">
      <Text style={heading}>Corrección completada</Text>

      <Text style={paragraph}>¡Hola!</Text>

      <Text style={paragraph}>
        Tu caso práctico {caseTitle ? `"${caseTitle}"` : ''} ha sido corregido. Ya puedes consultar
        el análisis detallado, tu puntuación y las recomendaciones de mejora.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={caseLink}>
          Ver corrección
        </Button>
      </Section>

      <Text style={paragraph}>Sigue practicando para mejorar tus resultados. ¡A por ello 😉 !</Text>
    </EmailLayout>
  );
};

export default CorrectionCompletedEmail;
