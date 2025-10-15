import { WorkflowNode } from "@/pages/Studio";
import { Card } from "@/components/ui/card";
import { Network } from "lucide-react";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  selectedNode: WorkflowNode | null;
  onSelectNode: (node: WorkflowNode) => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
}

const WorkflowCanvas = ({ nodes, selectedNode, onSelectNode, onUpdateNode }: WorkflowCanvasProps) => {
  const handleDragEnd = (nodeId: string, e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    onUpdateNode(nodeId, {
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 50,
    });
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Nodes */}
      <div className="relative h-full w-full p-8">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="space-y-4">
              <Network className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Click "Add Agent" to start building your workflow
              </p>
            </div>
          </div>
        ) : (
          nodes.map((node) => (
            <Card
              key={node.id}
              draggable
              onDragEnd={(e) => handleDragEnd(node.id, e)}
              onClick={() => onSelectNode(node)}
              className={`
                absolute cursor-move p-4 w-48 border-2 transition-all
                ${selectedNode?.id === node.id 
                  ? 'border-primary shadow-lg' 
                  : 'border-border hover:border-primary/50'
                }
                bg-card/80 backdrop-blur-sm
              `}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="font-semibold text-sm truncate">{node.role}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {node.systemPrompt}
                </p>
                <div className="text-xs text-muted-foreground">
                  Model: {node.model.split('/')[1]}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvas;