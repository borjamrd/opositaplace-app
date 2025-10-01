// src/components/assistant/ReferencesPanel.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import { ChatMessage } from '@/ai/flows/opositaplaceChatFlow';
import { randomUUID } from 'crypto';

interface ReferencesPanelProps {
    sources: ChatMessage['sources'];
    onClose: () => void;
}

export function ReferencesPanel({ sources, onClose }: ReferencesPanelProps) {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="absolute top-4 right-2 h-full w-full md:w-1/3 bg-background border rounded-xl z-10  flex flex-col">
            {/* Encabezado del Panel */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fuentes consultadas
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar panel de referencias</span>
                </Button>
            </div>

            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-4">
                    {sources.map((source, index) => (
                        <Card key={source.id || randomUUID()}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    [{index + 1}] {source.title} (pág. {source.pageIdentifier})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">
                                    "{source.text}"
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
