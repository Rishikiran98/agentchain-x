import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Template {
  id: string;
  title: string;
  description: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface TemplateSelectorProps {
  onSelect: (templateId: string, nodes: WorkflowNode[], edges: WorkflowEdge[], title: string) => void;
  onClose: () => void;
}

const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('id, title, description, nodes, edges')
        .eq('is_template', true)
        .order('created_at');

      if (!error && data) {
        setTemplates(data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          nodes: t.nodes as unknown as WorkflowNode[],
          edges: t.edges as unknown as WorkflowEdge[]
        })));
      }
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Workflow Templates</DialogTitle>
          <DialogDescription>
            Start with a pre-built workflow and customize it for your needs
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="p-6 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => onSelect(template.id, template.nodes, template.edges, template.title)}
              >
                <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description || "Pre-configured workflow template"}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;
