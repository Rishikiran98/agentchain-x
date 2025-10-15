import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { workflowTemplates } from "@/data/templates";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

interface TemplateSelectorProps {
  onSelect: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  onClose: () => void;
}

const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Workflow Templates</DialogTitle>
          <DialogDescription>
            Start with a pre-built workflow and customize it for your needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {workflowTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="p-6 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => onSelect(template.nodes, template.edges)}
            >
              <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/10 px-2 py-1 rounded">
                  {template.nodes.length} agents
                </span>
                <span className="bg-accent/10 px-2 py-1 rounded">
                  {template.edges.length} connections
                </span>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" className="w-full">
                  Load Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;