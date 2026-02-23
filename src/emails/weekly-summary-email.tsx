import { Heading, Link, Section, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './components/email-layout';

// Define las props que recibirá tu email
interface WeeklySummaryEmailProps {
  userName: string;
  summary: {
    studyHours: number;
    testsCompleted: number;
    averageScore: number;
    cardsReviewed: number;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const WeeklySummaryEmail = ({ userName, summary }: WeeklySummaryEmailProps) => (
  <EmailLayout previewText="Tu resumen semanal de Opositaplace está listo.">
    <Heading style={heading}>¡Aquí tienes tu resumen, {userName || 'Opositor'}!</Heading>

    <Text style={paragraph}>¡Buen trabajo esta semana! Aquí tienes un vistazo a tu progreso:</Text>

    <Section style={summarySection}>
      <Text style={summaryItem}>
        <strong>Horas de estudio:</strong> {summary?.studyHours?.toFixed(1) || 0}
      </Text>
      <Text style={summaryItem}>
        <strong>Tests completados:</strong> {summary?.testsCompleted || 0}
      </Text>
      <Text style={summaryItem}>
        <strong>Nota media:</strong> {summary?.averageScore?.toFixed(1) || 0}%
      </Text>
      <Text style={summaryItem}>
        <strong>Tarjetas repasadas:</strong> {summary?.cardsReviewed || 0}
      </Text>
    </Section>

    <Text style={paragraph}>Sigue así, ¡vas por el buen camino!</Text>
    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
      <Link href={baseUrl} style={button}>
        Volver a mi planificación
      </Link>
    </Section>
  </EmailLayout>
);

export default WeeklySummaryEmail;

const summarySection = {
  padding: '24px',
  border: '1px solid #e6ebf1',
  borderRadius: '4px',
  margin: '24px 40px',
};

const summaryItem = {
  ...paragraph,
  padding: '4px 0',
  margin: '0',
};
