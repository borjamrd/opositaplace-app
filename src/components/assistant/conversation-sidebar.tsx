// src/components/assistant/ConversationSidebar.tsx

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, MessageSquareText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
};

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data);
      }
      setIsLoading(false);
    };

    fetchConversations();
  }, [currentConversationId]); 

  return (
    <div className="flex flex-col h-full bg-muted/50 border-r w-64">
      <div className="p-2">
        <Button className="w-full justify-start" onClick={onNewChat}>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Nuevo chat
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            conversations.map((conv) => (
              <Button
                key={conv.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start text-left truncate',
                  conv.id === currentConversationId && 'bg-accent text-accent-foreground'
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <MessageSquareText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{conv.title || 'Chat sin título'}</span>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}