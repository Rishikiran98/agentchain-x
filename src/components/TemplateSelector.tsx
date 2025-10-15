import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { Loader2 } from "lucide-react";

interface TemplateSelectorProps {
  onSelect: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  onClose: () => void;
}

const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('is_template', true)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {templates.map((template) => {
              const nodes = template.nodes as WorkflowNode[];
              const edges = template.edges as WorkflowEdge[];
              
              return (
                <Card 
                  key={template.id} 
                  className="p-6 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => onSelect(nodes, edges)}
                >
                  <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 px-2 py-1 rounded">
                      {nodes.length} agents
                    </span>
                    <span className="bg-accent/10 px-2 py-1 rounded">
                      {edges.length} connections
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full">
                      Load Template
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;