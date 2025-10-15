import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface RoleTemplate {
  emoji: string;
  name: string;
  systemPrompt: string;
  description: string;
}

const roleTemplates: RoleTemplate[] = [
  {
    emoji: "🧠",
    name: "Researcher",
    systemPrompt: "You are a research agent. Gather facts, analyze data, and provide comprehensive context on the given topic. Be thorough and cite sources when possible.",
    description: "Gathers facts and context"
  },
  {
    emoji: "💡",
    name: "Strategist",
    systemPrompt: "You are a strategy agent. Analyze information and develop actionable plans. Focus on feasibility, risks, and opportunities.",
    description: "Plans and analyzes outcomes"
  },
  {
    emoji: "✍️",
    name: "Writer",
    systemPrompt: "You are a writing agent. Create clear, engaging content based on provided information. Structure your writing effectively and maintain consistent tone.",
    description: "Drafts and summarizes content"
  },
  {
    emoji: "🔍",
    name: "Reviewer",
    systemPrompt: "You are a review agent. Critically evaluate outputs for quality, accuracy, and completeness. Provide constructive feedback and suggest improvements.",
    description: "Critiques and improves output"
  },
  {
    emoji: "⚙️",
    name: "Developer",
    systemPrompt: "You are a development agent. Write clean, efficient code following best practices. Include comments and handle edge cases appropriately.",
    description: "Writes and reviews code"
  },
  {
    emoji: "🎨",
    name: "Designer",
    systemPrompt: "You are a design agent. Create user-friendly interfaces and experiences. Consider usability, accessibility, and visual hierarchy.",
    description: "Designs interfaces and UX"
  },
  {
    emoji: "📊",
    name: "Analyst",
    systemPrompt: "You are an analytics agent. Extract insights from data, identify patterns, and present findings clearly. Use data-driven reasoning.",
    description: "Analyzes data and trends"
  },
  {
    emoji: "🎯",
    name: "Product Manager",
    systemPrompt: "You are a product management agent. Define requirements, prioritize features, and align stakeholders. Focus on user needs and business value.",
    description: "Manages product strategy"
  },
];

interface AgentRoleTemplatesProps {
  onSelectRole: (role: string, systemPrompt: string) => void;
}

const AgentRoleTemplates = ({ onSelectRole }: AgentRoleTemplatesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div className="absolute right-0 top-0 h-full">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="h-full rounded-none border-l border-border bg-card/50 hover:bg-card"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-0 h-full w-72 border-l border-border bg-card/95 backdrop-blur-sm flex flex-col shadow-xl">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-sm">Agent Role Library</h3>
        <Button
          onClick={() => setIsExpanded(false)}
          variant="ghost"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {roleTemplates.map((template) => (
            <Card
              key={template.name}
              className="p-3 hover:border-primary/50 transition-all cursor-pointer bg-background/50"
              onClick={() => onSelectRole(template.name, template.systemPrompt)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-border bg-background/50">
        <p className="text-xs text-muted-foreground text-center">
          Click any role to auto-fill agent settings
        </p>
      </div>
    </div>
  );
};

export default AgentRoleTemplates;