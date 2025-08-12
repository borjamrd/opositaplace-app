'use client';

import { ChatMessage, opositaplaceChatFlow } from '@/ai/flows/opositaplaceChatFlow';
import { streamFlow } from '@genkit-ai/next/client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookCheck, FileText, HelpCircle, Loader2, Send } from 'lucide-react';
import { Card, CardHeader } from '../ui/card';
import { ReferencesPanel } from './references-panel';

const suggestedQuestions = [
    {
        icon: <FileText className="h-5 w-5" />,
        text: '¿Qué es un contrato menor y cuáles son sus umbrales?',
    },
    {
        icon: <HelpCircle className="h-5 w-5" />,
        text: 'Explícame el recurso de alzada y cuándo se utiliza.',
    },
    {
        icon: <FileText className="h-5 w-5" />,
        text: 'Describe las funciones del Defensor del Pueblo.',
    },
    {
        icon: <HelpCircle className="h-5 w-5" />,
        text: '¿Cuáles son los valores superiores de la Constitución?',
    },
];

export function ChatAssistant() {
    const [userInput, setUserInput] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [selectedSources, setSelectedSources] = useState<ChatMessage['sources'] | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isLoading]);

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>, questionText?: string) => {
        if (event) event.preventDefault();

        const currentInput = questionText || userInput.trim();
        if (!currentInput) return;

        const newUserMessage: ChatMessage = { role: 'user', content: currentInput };

        setUserInput('');
        setIsLoading(true);

        const placeholderModelMessage: ChatMessage = { role: 'model', content: '...' };
        setChatMessages((prev) => [...prev, newUserMessage, placeholderModelMessage]);

        const payload = {
            query: currentInput,
            sessionPath: sessionId,
            chatHistory: [...chatMessages, newUserMessage],
        };

        try {
            const result = streamFlow<typeof opositaplaceChatFlow>({
                url: '/api/opositaplaceChatFlow',
                input: payload,
            });

            for await (const chunk of result.stream) {
                if (chunk?.replyChunk) {
                    setChatMessages((prevMessages) =>
                        prevMessages.map((msg, index) => {
                            if (index === prevMessages.length - 1) {
                                return {
                                    ...msg,
                                    content:
                                        msg.content === '...'
                                            ? chunk.replyChunk 
                                            : msg.content + chunk.replyChunk,
                                };
                            }
                            return msg;
                        })
                    );
                }
            }

            const finalOutput = await result.output;

            if (finalOutput) {
                setSessionId(finalOutput.sessionPath);
                setChatMessages((prevMessages) =>
                    prevMessages.map((msg, index) => {
                        if (index === prevMessages.length - 1) {
                            return {
                                ...msg,
                                content: finalOutput.fullReply,
                                sources: finalOutput.references,
                            };
                        }
                        return msg;
                    })
                );
            }
        } catch (error) {
            console.error('Error al llamar al flow:', error);
            setChatMessages((prevMessages) =>
                prevMessages.map((msg, index) =>
                    index === prevMessages.length - 1
                        ? {
                              ...msg,
                              content: 'Error al obtener respuesta. Inténtalo de nuevo.',
                          }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col h-[calc(100vh-10rem)] md:h-[70vh] w-full mx-auto overflow-hidden">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">
                                Hola, ¿En qué puedo ayudarte hoy?
                            </h2>
                            <p className="text-muted-foreground">
                                Recuerda que únicamente te daré respuestas basadas en la
                                documentación oficial.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
                            {suggestedQuestions.map((sq, index) => (
                                <Card
                                    key={index}
                                    className="cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleSubmit(undefined, sq.text)}
                                >
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        {sq.icon}
                                        <p className="text-sm font-medium">{sq.text}</p>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-end gap-2 ${
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm md:text-base break-words ${
                                        msg.role === 'user' ? '' : 'bg-muted'
                                    }`}
                                >
                                    {msg.content === '...' && isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Pensando...</span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    // Personalizamos los elementos de markdown
                                                    h1: ({ node, ...props }) => (
                                                        <h1
                                                            className="text-lg font-bold my-2"
                                                            {...props}
                                                        />
                                                    ),
                                                    h2: ({ node, ...props }) => (
                                                        <h2
                                                            className="text-md font-semibold my-2"
                                                            {...props}
                                                        />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3
                                                            className="text-base font-medium my-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p className="my-1" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul
                                                            className="list-disc pl-4 my-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol
                                                            className="list-decimal pl-4 my-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="my-0.5" {...props} />
                                                    ),
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            className="text-blue-500 hover:underline"
                                                            {...props}
                                                        />
                                                    ),
                                                    strong: ({ node, ...props }) => (
                                                        <strong className="font-bold" {...props} />
                                                    ),
                                                    em: ({ node, ...props }) => (
                                                        <em className="italic" {...props} />
                                                    ),
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote
                                                            className="border-l-4 border-gray-300 pl-4 my-2 italic"
                                                            {...props}
                                                        />
                                                    ),
                                                    code: ({ node, ...props }) => (
                                                        <code
                                                            className="bg-gray-100 dark:bg-gray-800 rounded px-1"
                                                            {...props}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                            {msg.role === 'model' &&
                                                msg.sources &&
                                                msg.sources.length > 0 && (
                                                    <div className="mt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedSources(msg.sources)
                                                            }
                                                        >
                                                            <BookCheck className="h-4 w-4 mr-2" />
                                                            Referencias
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>
            {selectedSources && (
                <ReferencesPanel
                    sources={selectedSources}
                    onClose={() => setSelectedSources(null)}
                />
            )}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Escribe tu consulta..."
                        disabled={isLoading}
                        className="flex-grow min-h-14"
                        aria-label="Tu mensaje"
                    />
                    <Button type="submit" disabled={isLoading} size="icon">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                        <span className="sr-only">Enviar mensaje</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
