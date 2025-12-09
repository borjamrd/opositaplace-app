import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout, btnContainer, button, heading, paragraph } from './components/email-layout';

interface InvoicePaidEmailProps {
  userName?: string;
  invoiceUrl?: string; // Enlace al PDF de la factura
}

export const InvoicePaidEmail = ({ userName = 'Opositor', invoiceUrl }: InvoicePaidEmailProps) => {
  return (
    <EmailLayout previewText="Tu factura de Opositaplace">
      <Heading style={heading}>Aquí tienes tu factura</Heading>
      <Text style={paragraph}>Hola {userName},</Text>
      <Text style={paragraph}>Te adjuntamos la factura de tu suscripción a Opositaplace.</Text>
      {invoiceUrl && (
        <Section style={btnContainer}>
          <Button style={button} href={invoiceUrl}>
            Descargar Factura (PDF)
          </Button>
        </Section>
      )}
      <Text style={paragraph}>
        Gracias por seguir confiando en nosotros.
        <br />- El equipo de Opositaplace
      </Text>
    </EmailLayout>
  );
};

InvoicePaidEmail.PreviewProps = {
  userName: 'Opositor',
  invoiceUrl: 'https://opositaplace.com/invoice.pdf',
} as InvoicePaidEmailProps;

export default InvoicePaidEmail;
