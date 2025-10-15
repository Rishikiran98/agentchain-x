import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Copy, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Workflow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  nodes: any[];
  edges: any[];
}

interface WorkflowManagementProps {
  onLoadWorkflow: (workflow: Workflow) => void;
  onClose: () => void;
}

const WorkflowManagement = ({ onLoadWorkflow, onClose }: WorkflowManagementProps) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_template', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflows((data as any) || []);
    } catch (error: any) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error loading workflows",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkflows(workflows.filter(w => w.id !== id));
      toast({
        title: "Workflow deleted",
        description: "Your workflow has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error deleting workflow",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteWorkflowId(null);
    }
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          title: `${workflow.title} (Copy)`,
          nodes: workflow.nodes,
          edges: workflow.edges,
          is_template: false,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkflows([data as any, ...workflows]);
      toast({
        title: "Workflow duplicated",
        description: "A copy has been created",
      });
    } catch (error: any) {
      console.error('Error duplicating workflow:', error);
      toast({
        title: "Error duplicating workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Workflows</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading workflows...
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No workflows match your search" : "No workflows yet. Create your first one!"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      onLoadWorkflow(workflow);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{workflow.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                          </span>
                          <span>{workflow.nodes?.length || 0} agents</span>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(workflow)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteWorkflowId(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>

      <AlertDialog open={!!deleteWorkflowId} onOpenChange={() => setDeleteWorkflowId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteWorkflowId && handleDelete(deleteWorkflowId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkflowManagement;
