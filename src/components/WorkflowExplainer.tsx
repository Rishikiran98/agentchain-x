import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface WorkflowExplainerProps {
  open: boolean;
  onClose: () => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const WorkflowExplainer = ({ open, onClose, nodes, edges }: WorkflowExplainerProps) => {
  const generateExplanation = () => {
    if (nodes.length === 0) {
      return "You haven't created any agents yet. Click 'Add Agent' to start building your workflow!";
    }

    if (edges.length === 0 && nodes.length > 1) {
      return `You have ${nodes.length} agents (${nodes.map(n => n.role).join(", ")}) but they aren't connected yet. Click the "Connect" button to link them together.`;
    }

    if (edges.length === 0 && nodes.length === 1) {
      return `You have a single "${nodes[0].role}" agent. Add more agents and connect them to create a multi-agent workflow.`;
    }

    // Build a narrative
    const connectionMap = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!connectionMap.has(edge.from)) {
        connectionMap.set(edge.from, []);
      }
      connectionMap.get(edge.from)!.push(edge.to);
    });

    // Find starting nodes (no incoming edges)
    const incomingCount = new Map<string, number>();
    nodes.forEach(n => incomingCount.set(n.id, 0));
    edges.forEach(edge => {
      incomingCount.set(edge.to, (incomingCount.get(edge.to) || 0) + 1);
    });
    
    const startNodes = nodes.filter(n => incomingCount.get(n.id) === 0);
    
    let explanation = "Your workflow: ";
    
    if (startNodes.length === 0) {
      // Circular or complex
      explanation += `You have ${nodes.length} connected agents forming a complex collaboration network.`;
    } else if (startNodes.length === 1) {
      explanation += `The ${startNodes[0].role} starts the process`;
      
      const visited = new Set<string>();
      const describe = (nodeId: string): string => {
        if (visited.has(nodeId)) return "";
        visited.add(nodeId);
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return "";
        
        const next = connectionMap.get(nodeId) || [];
        if (next.length === 0) return "";
        
        const nextNodes = next.map(id => nodes.find(n => n.id === id)).filter(Boolean);
        if (nextNodes.length === 1) {
          return `, then passes to the ${nextNodes[0]!.role}${describe(nextNodes[0]!.id)}`;
        } else {
          return `, which branches to multiple agents: ${nextNodes.map(n => n!.role).join(", ")}`;
        }
      };
      
      explanation += describe(startNodes[0].id);
      explanation += ".";
    } else {
      explanation += `Multiple agents start in parallel: ${startNodes.map(n => n.role).join(", ")}.`;
    }

    return explanation;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Your Workflow Explained
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-foreground leading-relaxed">
            {generateExplanation()}
          </p>
          
          {nodes.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Agents in your workflow:</p>
              <ul className="space-y-1">
                {nodes.map(node => (
                  <li key={node.id} className="text-sm text-muted-foreground">
                    • <span className="font-medium text-foreground">{node.role}</span> using {node.model.split('/')[1]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowExplainer;