import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const exportLog = () => {
    const logText = messages
      .map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role}:\n${m.content}\n`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-log-${runId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-96 border-t border-border bg-background/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Conversation Log
        </h3>
        {messages.length > 0 && (
          <Button
            onClick={exportLog}
            size="sm"
            variant="ghost"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Waiting for agents to communicate...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <Card key={msg.id} className="p-4 bg-card/50 border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                    </div>
                    {idx < messages.length - 1 && (
                      <div className="h-full w-0.5 bg-primary/20" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">
                        {msg.role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-foreground/90 prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc" {...props} />,
                          ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal" {...props} />,
                          h3: ({node, ...props}) => <h3 className="font-semibold mb-1 mt-2" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                          code: ({node, inline, ...props}: any) => 
                            inline ? 
                              <code className="bg-primary/10 px-1 py-0.5 rounded text-xs" {...props} /> :
                              <code className="block bg-primary/10 p-2 rounded my-2 overflow-x-auto text-xs" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExecutionPanel;