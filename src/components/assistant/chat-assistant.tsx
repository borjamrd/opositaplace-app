'use client';

import { ChatMessage, opositaplaceChatFlow } from '@/ai/flows/opositaplaceChatFlow';
import { streamFlow } from '@genkit-ai/next/client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudySessionStore } from '@/store/study-session-store';
import { Bot, Loader2, Send, User } from 'lucide-react';

export function ChatAssistant() {
    const [userInput, setUserInput] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { activeOpposition } = useStudySessionStore();

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Para auto-scroll al último mensaje
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isLoading]);

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        const placeholderModelMessage: ChatMessage = {
            role: 'model',
            content: '...',
        };
        setChatMessages((prevMessages) => [...prevMessages, placeholderModelMessage]);

        const historyForPayload = chatMessages.filter((msg) => msg !== newUserMessage);

        const payload = {
            query: currentInput,
            chatHistory: historyForPayload,
            currentOppositionName: activeOpposition?.name,
        };

        try {
            const result = streamFlow<typeof opositaplaceChatFlow>({
                url: '/api/opositaplaceChatFlow',
                input: payload,
            });

            let accumulatedReply = '';

            console.log('Inspeccionando result:', result);
            console.log('typeof result.stream:', typeof result.stream);
            if (result && typeof result.stream === 'object' && result.stream !== null) {
                console.log('Keys of result.stream:', Object.keys(result.stream));
            }
            for await (const chunk of result.stream) {
                if (chunk && typeof chunk.replyChunk === 'string') {
                    accumulatedReply += chunk.replyChunk;
                    setChatMessages((prevMessages) =>
                        prevMessages.map((msg, index) =>
                            index === prevMessages.length - 1
                                ? { ...msg, content: accumulatedReply }
                                : msg
                        )
                    );
                }
            }

            const finalOutput = await result.output;
            if (
                finalOutput &&
                finalOutput.fullReply &&
                finalOutput.fullReply !== accumulatedReply
            ) {
                setChatMessages((prevMessages) =>
                    prevMessages.map((msg, index) =>
                        index === prevMessages.length - 1
                            ? { ...msg, content: finalOutput.fullReply }
                            : msg
                    )
                );
            } else if (!finalOutput || !finalOutput.fullReply) {
                setChatMessages((prevMessages) =>
                    prevMessages.map((msg, index) =>
                        index === prevMessages.length - 1 && accumulatedReply
                            ? { ...msg, content: accumulatedReply }
                            : msg
                    )
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
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[70vh] w-full mx-auto">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {chatMessages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {msg.role === 'model' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        <Bot size={20} />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm md:text-base break-words ${
                                    msg.role === 'user'
                                        ? ''
                                        : 'bg-muted'
                                }`}
                            >
                                {msg.content === '...' && isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Escribiendo...</span>
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
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        <User size={20} />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Escribe tu consulta..."
                        disabled={isLoading}
                        className="flex-grow"
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
