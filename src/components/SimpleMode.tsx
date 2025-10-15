import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Lightbulb, Zap } from "lucide-react";
import { WorkflowNode } from "@/types/workflow";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SimpleModeProps {
  onSwitchToAdvanced: () => void;
}

const SimpleMode = ({ onSwitchToAdvanced }: SimpleModeProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [agents, setAgents] = useState<WorkflowNode[]>([]);
  const [currentAgent, setCurrentAgent] = useState(0);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [finalResult, setFinalResult] = useState("");
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const { toast } = useToast();

  const examples = [
    "Help me brainstorm ideas for an eco-friendly product",
    "Write a professional email declining a job offer politely",
    "Create a business plan for a mobile app that helps people save money",
    "Research the benefits of meditation and summarize in 3 paragraphs"
  ];

  useEffect(() => {
    if (isExecuting && agents.length > 0) {
      const interval = setInterval(() => {
        setCurrentAgent((prev) => {
          if (prev < agents.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isExecuting, agents.length]);

  // Subscribe to execution messages
  useEffect(() => {
    if (!workflowId) return;

    const channel = supabase
      .channel('execution-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `run_id=eq.${workflowId}`
        },
        (payload: any) => {
          const newMsg = payload.new;
          setMessages(prev => [...prev, {
            role: newMsg.node_id || 'system',
            content: newMsg.content
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workflowId]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Let's get started!",
        description: "Tell me what you'd like to create",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setMessages([]);
    setFinalResult("");
    setCurrentAgent(0);

    try {
      // Generate workflow
      const { data: workflow, error: genError } = await supabase.functions.invoke('generate-workflow', {
        body: { prompt }
      });

      if (genError) throw genError;

      setAgents(workflow.nodes);
      
      // Save workflow to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: savedWorkflow, error: saveError } = await supabase
        .from('workflows')
        .insert([{
          user_id: user.id,
          title: prompt.slice(0, 50),
          nodes: workflow.nodes,
          edges: workflow.edges,
          is_template: false
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      toast({
        title: "Your AI team is on it 💡",
        description: `${workflow.nodes.length} agents working together...`,
      });

      setIsGenerating(false);
      setIsExecuting(true);

      // Execute workflow
      const { data: execData, error: execError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: savedWorkflow.id }
      });

      if (execError) throw execError;

      setWorkflowId(execData.runId);

      // Wait for completion (simplified - in production would use realtime)
      setTimeout(() => {
        setIsExecuting(false);
        
        // Get the last message as final result
        if (messages.length > 0) {
          setFinalResult(messages[messages.length - 1].content);
        }

        toast({
          title: "✨ Done!",
          description: "Here's what your AI team created",
          duration: 5000,
        });
      }, workflow.nodes.length * 3500);

    } catch (error: any) {
      setIsGenerating(false);
      setIsExecuting(false);
      toast({
        title: "Something went wrong",
        description: error.message || "Try again or rephrase your request",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setPrompt("");
    setAgents([]);
    setMessages([]);
    setFinalResult("");
    setCurrentAgent(0);
    setWorkflowId(null);
    setShowWorkflow(false);
  };

  const getAgentEmoji = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes('research')) return '🔍';
    if (lower.includes('write') || lower.includes('writer')) return '✍️';
    if (lower.includes('strateg')) return '💡';
    if (lower.includes('review')) return '🔍';
    if (lower.includes('develop')) return '💻';
    if (lower.includes('analy')) return '📊';
    if (lower.includes('design')) return '🎨';
    if (lower.includes('edit')) return '✏️';
    return '🤖';
  };

  if (finalResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-3xl w-full space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">All Done! ✨</h2>
            <p className="text-muted-foreground">Your AI team collaborated to create this</p>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {finalResult}
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={() => setShowWorkflow(!showWorkflow)}
              variant="outline"
              className="w-full"
            >
              {showWorkflow ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {showWorkflow ? "Hide" : "See"} how this worked
            </Button>

            {showWorkflow && (
              <Card className="p-6 bg-card/30 animate-fade-in">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Your AI Team
                </h3>
                <div className="space-y-3">
                  {agents.map((agent, i) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <span className="text-2xl">{getAgentEmoji(agent.role)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.role}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{agent.systemPrompt}</div>
                      </div>
                      {i < agents.length - 1 && (
                        <div className="text-muted-foreground">→</div>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={onSwitchToAdvanced}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4"
                >
                  Open in Advanced Mode
                </Button>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Another Idea
              </Button>
              <Button
                onClick={onSwitchToAdvanced}
                size="lg"
                variant="outline"
              >
                <Zap className="h-4 w-4 mr-2" />
                Advanced Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating || isExecuting) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-2xl w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {isGenerating ? "Building your AI team..." : "Your team is working..."}
            </h2>
            <p className="text-muted-foreground">
              {isGenerating ? "Selecting the best agents for your task" : "Watch them collaborate in real-time"}
            </p>
          </div>

          {agents.length > 0 && (
            <div className="space-y-4">
              {agents.map((agent, i) => (
                <Card 
                  key={agent.id}
                  className={`p-6 transition-all duration-500 ${
                    i === currentAgent 
                      ? 'bg-primary/10 border-primary shadow-lg scale-105' 
                      : i < currentAgent 
                      ? 'bg-card/50 border-border opacity-70'
                      : 'bg-card/30 border-border/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getAgentEmoji(agent.role)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{agent.role}</h3>
                        {i === currentAgent && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Thinking...
                          </span>
                        )}
                        {i < currentAgent && (
                          <span className="text-xs text-green-500">✓ Done</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.systemPrompt}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <Card className="p-4 bg-card/30 max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-3 text-sm">Team Conversation</h3>
              <div className="space-y-2">
                {messages.slice(-5).map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-primary">{agents.find(a => a.id === msg.role)?.role || 'Agent'}:</span>
                    <span className="text-muted-foreground ml-2">{msg.content.slice(0, 100)}...</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Tell me what you'd like to create
          </h1>
          <p className="text-lg text-muted-foreground">
            I'll build a team of AI agents to make it happen
          </p>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Help me write a product announcement for our new AI assistant..."
            className="min-h-[120px] text-lg border-0 focus-visible:ring-0 bg-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Press Cmd/Ctrl + Enter to submit
            </span>
            <Button 
              onClick={handleSubmit}
              size="lg"
              disabled={!prompt.trim()}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Let's Go 🚀
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Try one of these ideas:</p>
          <div className="grid grid-cols-2 gap-2">
            {examples.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={onSwitchToAdvanced}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Need more control? Switch to Advanced Mode →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleMode;
