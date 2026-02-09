import { Container, Section, Text, Hr } from '@react-email/components';
import { EmailLayout, heading, paragraph, container } from './components/email-layout';
import * as React from 'react';

interface AdminNotificationEmailProps {
    title: string;
    message: string;
    details?: Record<string, string | undefined | null>;
}

export default function AdminNotificationEmail({
    title,
    message,
    details = {},
}: AdminNotificationEmailProps) {
    return (
        <EmailLayout previewText={title}>
            <Container>
                <Text style={heading}>{title}</Text>
                <Text style={paragraph}>{message}</Text>

                {Object.keys(details).length > 0 && (
                    <Section style={{ padding: '0 40px', marginTop: '20px' }}>
                        <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
                        <Text style={{ ...paragraph, fontWeight: 'bold', marginBottom: '10px' }}>Detalles:</Text>
                        {Object.entries(details).map(([key, value]) => (
                            <Text key={key} style={{ ...paragraph, margin: '5px 0', fontSize: '14px' }}>
                                <strong>{key}:</strong> {value || 'N/A'}
                            </Text>
                        ))}
                    </Section>
                )}
            </Container>
        </EmailLayout>
    );
}
