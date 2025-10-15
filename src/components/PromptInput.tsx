import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  disabled?: boolean;
}

const PromptInput = ({ onGenerate, disabled }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const examples = [
    "Research and summarize the future of quantum computing",
    "Create a business plan for an AI-powered fitness app",
    "Analyze the pros and cons of remote work policies",
    "Write a technical blog post about microservices architecture"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please describe what you want the agents to do",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(prompt);
      setPrompt("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-3 p-4 border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your goal... (e.g., 'Research AI trends and write a summary')"
            className="min-h-[80px] resize-none"
            disabled={disabled || isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Press Cmd/Ctrl + Enter to generate • AI will create a team of agents for your task
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || !prompt.trim()}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Workflow
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {examples.map((example, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setPrompt(example)}
            disabled={disabled || isGenerating}
          >
            {example}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PromptInput;
