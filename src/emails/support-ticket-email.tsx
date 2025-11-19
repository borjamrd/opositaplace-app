import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface SupportTicketEmailProps {
  userEmail: string;
  userId: string;
  subject: string;
  description: string;
  attachmentUrl?: string | null;
}

export const SupportTicketEmail = ({
  userEmail,
  userId,
  subject,
  description,
  attachmentUrl,
}: SupportTicketEmailProps) => {
  const previewText = `Nueva incidencia: ${subject}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Soporte <strong>OpositaPlace</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-6">Hola equipo,</Text>

            <Text className="text-black text-[14px] leading-6">
              Se ha recibido una nueva incidencia del usuario <strong>{userEmail}</strong>.
            </Text>

            <Section className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4 mb-4">
              <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-2">ID Usuario</Text>
              <Text className="text-black text-sm m-0 mb-4 font-mono">{userId}</Text>

              <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-2">Asunto</Text>
              <Text className="text-black text-sm m-0 mb-4 font-medium">{subject}</Text>

              <Text className="text-gray-500 text-xs uppercase font-bold m-0 mb-2">
                Descripción
              </Text>
              <Text className="text-black text-sm m-0 whitespace-pre-wrap">{description}</Text>
            </Section>

            {attachmentUrl && (
              <Section className="mt-6 mb-6 text-center">
                <Text className="text-gray-500 text-xs uppercase font-bold mb-2">
                  Adjunto proporcionado
                </Text>
                <Img
                  src={attachmentUrl}
                  alt="Captura de pantalla"
                  className="max-w-full rounded-md border border-gray-200 mx-auto"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                <Link href={attachmentUrl} className="text-blue-600 text-sm underline mt-2 block">
                  Ver imagen original a tamaño completo
                </Link>
              </Section>
            )}

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-6 text-center">
              Este mensaje fue enviado desde el formulario de ayuda de OpositaPlace.
              <br />
              Puedes responder directamente a este correo para contactar con el usuario.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SupportTicketEmail;
