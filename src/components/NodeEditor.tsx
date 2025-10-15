import { WorkflowNode } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Settings } from "lucide-react";

interface NodeEditorProps {
  node: WorkflowNode;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}

const NodeEditor = ({ node, onUpdate, onDelete }: NodeEditorProps) => {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Agent Configuration</h2>
        </div>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Agent Role</Label>
          <Input
            id="role"
            value={node.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            placeholder="e.g., Researcher, Coder, Reviewer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">System Prompt</Label>
          <Textarea
            id="prompt"
            value={node.systemPrompt}
            onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
            placeholder="Describe the agent's goal and behavior..."
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select
            value={node.model}
            onValueChange={(value) => onUpdate({ model: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
              <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
              <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={node.temperature}
              onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="100"
              max="4000"
              step="100"
              value={node.maxTokens}
              onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;