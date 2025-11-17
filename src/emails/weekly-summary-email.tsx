import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

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
  <Html>
    <Head />
    <Preview>Tu resumen semanal de Opositaplace está listo.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/opositaplace_logo_v1.png`}
          width="150"
          height="auto"
          alt="Opositaplace"
          style={logo}
        />
        <Heading style={h1}>¡Aquí tienes tu resumen, {userName}!</Heading>

        <Text style={text}>¡Buen trabajo esta semana! Aquí tienes un vistazo a tu progreso:</Text>

        <Section style={summarySection}>
          <Text style={summaryItem}>
            <strong>Horas de estudio:</strong> {summary.studyHours.toFixed(1)}
          </Text>
          <Text style={summaryItem}>
            <strong>Tests completados:</strong> {summary.testsCompleted}
          </Text>
          <Text style={summaryItem}>
            <strong>Nota media:</strong> {summary.averageScore.toFixed(1)}%
          </Text>
          <Text style={summaryItem}>
            <strong>Tarjetas repasadas:</strong> {summary.cardsReviewed}
          </Text>
        </Section>

        <Text style={text}>Sigue así, ¡vas por el buen camino!</Text>
        <Link href={baseUrl} style={button}>
          Volver a mi planificación
        </Link>
      </Container>
    </Body>
  </Html>
);

export default WeeklySummaryEmail;

// (Añade tus estilos aquí, puedes copiarlos de otros emails)
const main = {
  /* ... */
};
const container = {
  /* ... */
};
const logo = {
  /* ... */
};
const h1 = {
  /* ... */
};
const text = {
  /* ... */
};
const summarySection = {
  /* ... */
};
const summaryItem = {
  /* ... */
};
const button = {
  /* ... */
};
