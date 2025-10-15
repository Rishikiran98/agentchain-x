import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";

interface Message {
  id: string;
  node_id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface ExecutionPanelProps {
  runId: string;
}

const ExecutionPanel = ({ runId }: ExecutionPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('run_id', runId)
        .order('timestamp', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${runId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `run_id=eq.${runId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId]);

  return (
    <div className="h-80 border-t border-border bg-background/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Agent Messages
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Waiting for agents to communicate...
            </p>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className="p-3 bg-card/50 border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {msg.role}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {msg.content}
                </p>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExecutionPanel;