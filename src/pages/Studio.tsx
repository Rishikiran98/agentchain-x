import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Network, Play, LogOut, Plus } from "lucide-react";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import ExecutionPanel from "@/components/ExecutionPanel";
import NodeEditor from "@/components/NodeEditor";

export interface WorkflowNode {
  id: string;
  role: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  x: number;
  y: number;
}

const Studio = () => {
  const [user, setUser] = useState<any>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      role: "Agent",
      systemPrompt: "You are a helpful AI assistant.",
      model: "google/gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
      x: Math.random() * 300,
      y: Math.random() * 200,
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const saveWorkflow = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          user_id: user.id,
          title: 'My Workflow',
          nodes: nodes as any,
          edges: [] as any
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentWorkflowId(data.id);
      toast({
        title: "Workflow saved",
        description: "Your workflow has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const executeWorkflow = async () => {
    if (!currentWorkflowId) {
      await saveWorkflow();
      return;
    }

    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: currentWorkflowId }
      });

      if (error) throw error;

      setCurrentRunId(data.runId);
      toast({
        title: "Workflow executing",
        description: "Your agents are working...",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Workflow Studio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={addNode}
              variant="outline"
              size="sm"
              className="border-primary/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
            <Button
              onClick={saveWorkflow}
              variant="outline"
              size="sm"
            >
              Save
            </Button>
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onUpdateNode={updateNode}
          />
        </div>

        {/* Right Panel */}
        <div className="w-96 border-l border-border bg-card/50 flex flex-col">
          {selectedNode ? (
            <NodeEditor
              node={selectedNode}
              onUpdate={(updates) => updateNode(selectedNode.id, updates)}
              onDelete={() => deleteNode(selectedNode.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a node to edit
            </div>
          )}
          
          {currentRunId && (
            <ExecutionPanel runId={currentRunId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;