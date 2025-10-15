import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Lightbulb, Zap } from "lucide-react";
import { WorkflowNode } from "@/types/workflow";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SimpleModeProps {
  onSwitchToAdvanced: () => void;
}

const SimpleMode = ({ onSwitchToAdvanced }: SimpleModeProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [agents, setAgents] = useState<WorkflowNode[]>([]);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; agent: string }>>([]);
  const [finalResult, setFinalResult] = useState("");
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const { toast } = useToast();

  const examples = [
    "Help me brainstorm ideas for an eco-friendly product",
    "Write a professional email declining a job offer politely",
    "Create a business plan for a mobile app that helps people save money",
    "Research the benefits of meditation and summarize in 3 paragraphs"
  ];

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

  const pollForCompletion = async (runId: string, workflowNodes: WorkflowNode[]) => {
    // Poll for run completion
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max
    
    const checkCompletion = async (): Promise<boolean> => {
      const { data: run } = await supabase
        .from('runs')
        .select('status')
        .eq('id', runId)
        .single();
      
      return run?.status === 'completed' || run?.status === 'failed';
    };

    while (attempts < maxAttempts) {
      const isComplete = await checkCompletion();
      if (isComplete) break;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    // Fetch all messages from this run
    const { data: runMessages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('run_id', runId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    console.log('Fetched messages:', runMessages);

    if (runMessages && runMessages.length > 0) {
      // Map messages to agents
      const formattedMessages = runMessages.map(msg => {
        const agent = workflowNodes.find(n => n.id === msg.node_id);
        return {
          role: msg.node_id,
          agent: agent?.role || 'Agent',
          content: msg.content
        };
      });

      setMessages(formattedMessages);
      
      // Get the last message as final result
      const lastMessage = runMessages[runMessages.length - 1];
      setFinalResult(lastMessage.content);

      setIsExecuting(false);
      toast({
        title: "✨ Done!",
        description: "Here's what your AI team created",
        duration: 5000,
      });
    } else {
      setIsExecuting(false);
      toast({
        title: "Workflow completed",
        description: "No output was generated",
        variant: "destructive",
      });
    }
  };

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

      setCurrentWorkflowId(savedWorkflow.id);

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

      console.log('Execution started, run ID:', execData.runId);

      // Poll for completion and fetch results
      await pollForCompletion(execData.runId, workflow.nodes);

    } catch (error: any) {
      console.error('Error in workflow execution:', error);
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
    setCurrentWorkflowId(null);
    setShowWorkflow(false);
  };

  if (finalResult) {
    return (
      <div className="h-full flex flex-col p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-3xl w-full mx-auto flex flex-col h-full animate-fade-in">
          <div className="text-center mb-6 flex-shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">All Done! ✨</h2>
            <p className="text-muted-foreground">Your AI team collaborated to create this</p>
          </div>

          <Card className="flex-1 overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 flex flex-col">
            <ScrollArea className="flex-1 p-8">
              <div className="prose prose-invert max-w-none text-foreground leading-relaxed break-words">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-6 text-primary break-words" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-5 text-primary break-words" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-2 mt-4 text-primary break-words" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed break-words" {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed break-words" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground break-words" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? 
                        <code className="bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono break-all" {...props} /> :
                        <code className="block bg-primary/10 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm whitespace-pre-wrap break-words" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                    pre: ({node, ...props}) => <pre className="overflow-x-auto whitespace-pre-wrap break-words" {...props} />,
                  }}
                >
                  {finalResult}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </Card>

          <div className="space-y-3 flex-shrink-0 mt-6">
            <Button
              onClick={() => setShowWorkflow(!showWorkflow)}
              variant="outline"
              className="w-full"
            >
              {showWorkflow ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {showWorkflow ? "Hide" : "See"} how this worked
            </Button>

            {showWorkflow && (
              <Card className="p-6 bg-card/30 animate-fade-in max-h-96 overflow-hidden flex flex-col">
                <h3 className="font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Your AI Team & Their Conversation
                </h3>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    {messages.map((msg, i) => (
                    <div key={i} className="p-4 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{getAgentEmoji(msg.agent)}</span>
                          <span className="font-semibold text-sm text-primary">{msg.agent}</span>
                        </div>
                        <div className="text-sm text-muted-foreground prose prose-sm prose-invert max-w-none break-words">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 break-words" {...props} />,
                              ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc" {...props} />,
                              ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                              code: ({node, inline, ...props}: any) => 
                                inline ? 
                                  <code className="bg-primary/10 px-1 py-0.5 rounded text-xs break-all" {...props} /> :
                                  <code className="block bg-primary/10 p-2 rounded my-2 overflow-x-auto text-xs whitespace-pre-wrap break-words" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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

          {agents.length > 0 && isExecuting && (
            <div className="space-y-4">
              {agents.map((agent, i) => (
                <Card 
                  key={agent.id}
                  className="p-6 bg-card/50 border-border animate-fade-in"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getAgentEmoji(agent.role)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{agent.role}</h3>
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </span>
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
              <h3 className="font-semibold mb-3 text-sm">Live Team Conversation</h3>
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className="text-sm p-2 rounded bg-background/30">
                    <span className="font-medium text-primary">{msg.agent}:</span>
                    <p className="text-muted-foreground mt-1">{msg.content.slice(0, 150)}...</p>
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
              disabled={!prompt.trim() || isGenerating || isExecuting}
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
