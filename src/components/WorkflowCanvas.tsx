import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, X } from "lucide-react";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  onSelectNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  isConnectMode: boolean;
  connectStart: string | null;
  onDeleteEdge: (edgeId: string) => void;
}

const WorkflowCanvas = ({ 
  nodes, 
  edges, 
  selectedNode, 
  onSelectNode, 
  onUpdateNode,
  isConnectMode,
  connectStart,
  onDeleteEdge 
}: WorkflowCanvasProps) => {
  const handleDragEnd = (nodeId: string, e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    onUpdateNode(nodeId, {
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 50,
    });
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x + 96, y: node.y + 50 } : { x: 0, y: 0 };
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

      {/* SVG for edges */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon 
              points="0 0, 10 3, 0 6" 
              fill="hsl(var(--primary))" 
            />
          </marker>
        </defs>
        {edges.map(edge => {
          const from = getNodePosition(edge.from);
          const to = getNodePosition(edge.to);
          
          return (
            <g key={edge.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
      </svg>

      {/* Edge delete buttons */}
      {edges.map(edge => {
        const from = getNodePosition(edge.from);
        const to = getNodePosition(edge.to);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        return (
          <Button
            key={`del-${edge.id}`}
            onClick={() => onDeleteEdge(edge.id)}
            size="sm"
            variant="destructive"
            className="absolute h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
            style={{
              left: `${midX - 12}px`,
              top: `${midY - 12}px`,
              zIndex: 2,
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        );
      })}

      {/* Nodes */}
      <div className="relative h-full w-full p-8" style={{ zIndex: 3 }}>
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
              onClick={() => onSelectNode(node.id)}
              className={`
                absolute cursor-move p-4 w-48 border-2 transition-all
                ${selectedNode?.id === node.id 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : connectStart === node.id
                  ? 'border-accent shadow-lg ring-2 ring-accent/20'
                  : 'border-border hover:border-primary/50'
                }
                ${isConnectMode ? 'cursor-pointer' : 'cursor-move'}
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