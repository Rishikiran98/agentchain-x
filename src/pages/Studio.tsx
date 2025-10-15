import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Network, Play, LogOut, Plus, Link2, Save, FolderOpen, HelpCircle, Sparkles, Lightbulb, Download } from "lucide-react";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import ExecutionPanel from "@/components/ExecutionPanel";
import NodeEditor from "@/components/NodeEditor";
import TemplateSelector from "@/components/TemplateSelector";
import OnboardingTour from "@/components/OnboardingTour";
import AgentRoleTemplates from "@/components/AgentRoleTemplates";
import HowItWorksModal from "@/components/HowItWorksModal";
import WorkflowExplainer from "@/components/WorkflowExplainer";
import WelcomeModal from "@/components/WelcomeModal";
import PromptInput from "@/components/PromptInput";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const Studio = () => {
  const [user, setUser] = useState<any>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcome(true), 500);
    }
    
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && hasSeenWelcome) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  // Auto-load template on first launch if no workflows
  useEffect(() => {
    const autoLoadTemplate = async () => {
      if (!user) return;

      try {
        // Check if user has any workflows
        const { data: userWorkflows, error: workflowError } = await supabase
          .from('workflows')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_template', false)
          .limit(1);

        if (workflowError) throw workflowError;

        // If no workflows, load the first template
        if (!userWorkflows || userWorkflows.length === 0) {
          const { data: templates, error: templateError } = await supabase
            .from('workflows')
            .select('*')
            .eq('is_template', true)
            .order('created_at', { ascending: true })
            .limit(1);

          if (templateError) throw templateError;

          if (templates && templates.length > 0) {
            const template = templates[0];
            setNodes(template.nodes as unknown as WorkflowNode[]);
            setEdges(template.edges as unknown as WorkflowEdge[]);
            setLoadedTemplateId(template.id);
            
            toast({
              title: "✨ Welcome to PromptChain-X!",
              description: `Loaded "${template.title}" template. Click Run Workflow to see agents collaborate!`,
              duration: 6000,
            });
          }
        }
      } catch (error) {
        console.error('Error auto-loading template:', error);
      }
    };

    if (user && nodes.length === 0) {
      autoLoadTemplate();
    }
  }, [user]);

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
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (isConnectMode) {
      if (!connectStart) {
        setConnectStart(nodeId);
        toast({
          title: "Connection mode",
          description: "Click another node to complete the connection",
        });
      } else if (connectStart !== nodeId) {
        // Create edge
        const newEdge: WorkflowEdge = {
          id: `edge-${Date.now()}`,
          from: connectStart,
          to: nodeId,
        };
        setEdges([...edges, newEdge]);
        setConnectStart(null);
        setIsConnectMode(false);
        toast({
          title: "Connection created",
          description: "Agents are now connected",
        });
      }
    } else {
      setSelectedNode(node);
    }
  };

  const toggleConnectMode = () => {
    setIsConnectMode(!isConnectMode);
    setConnectStart(null);
    if (!isConnectMode) {
      toast({
        title: "Connect mode enabled",
        description: "Click on nodes to create connections",
      });
    }
  };

  const deleteEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
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
      // If we loaded a template, always create a new workflow (clone)
      if (loadedTemplateId && !currentWorkflowId) {
        const { data, error } = await supabase
          .from('workflows')
          .insert([{
            user_id: user.id,
            title: 'My Custom Workflow',
            nodes: nodes as any,
            edges: edges as any,
            is_template: false
          }])
          .select()
          .single();

        if (error) throw error;
        setCurrentWorkflowId(data.id);
        setLoadedTemplateId(null); // Clear template ID after cloning
        
        toast({
          title: "Workflow saved",
          description: "Template cloned as your personal workflow.",
        });
      } else if (currentWorkflowId) {
        // Update existing workflow
        const { error } = await supabase
          .from('workflows')
          .update({
            nodes: nodes as any,
            edges: edges as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentWorkflowId);

        if (error) throw error;
        
        toast({
          title: "Workflow updated",
          description: "Your changes have been saved.",
        });
      } else {
        // Create new workflow from scratch
        const { data, error } = await supabase
          .from('workflows')
          .insert([{
            user_id: user.id,
            title: 'My Workflow',
            nodes: nodes as any,
            edges: edges as any,
            is_template: false
          }])
          .select()
          .single();

        if (error) throw error;
        setCurrentWorkflowId(data.id);
        
        toast({
          title: "Workflow saved",
          description: "Your workflow has been saved successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (templateId: string, templateNodes: WorkflowNode[], templateEdges: WorkflowEdge[], templateTitle: string) => {
    setNodes(templateNodes);
    setEdges(templateEdges);
    setCurrentWorkflowId(null);
    setLoadedTemplateId(templateId);
    setShowTemplates(false);
    toast({
      title: "Template loaded",
      description: `"${templateTitle}" is ready to customize and run`,
    });
  };

  const loadDemoWorkflow = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (templates && templates.length > 0) {
        const template = templates[0];
        setNodes(template.nodes as unknown as WorkflowNode[]);
        setEdges(template.edges as unknown as WorkflowEdge[]);
        setLoadedTemplateId(template.id);
        
        toast({
          title: "✨ Demo workflow loaded!",
          description: "Click 'Run Workflow' to see it in action",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error loading demo:', error);
      toast({
        title: "Error",
        description: "Could not load demo workflow",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = (role: string, systemPrompt: string) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { role, systemPrompt });
      toast({
        title: "Role applied",
        description: `${role} template loaded`,
      });
    } else {
      toast({
        title: "Select an agent first",
        description: "Click on an agent to apply this role template",
        variant: "destructive",
      });
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setRunTour(false);
  };

  const handleWelcomeClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const generateWorkflowFromPrompt = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: { prompt }
      });

      if (error) throw error;

      setNodes(data.nodes as WorkflowNode[]);
      setEdges(data.edges as WorkflowEdge[]);
      setCurrentWorkflowId(null);
      setLoadedTemplateId(null);
      
      toast({
        title: "✨ Workflow generated!",
        description: "Your AI agent team is ready. Review and run when ready.",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate workflow. Try again or use a template.",
        variant: "destructive",
      });
    }
  };

  const exportWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      exported_at: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Workflow exported",
      description: "JSON file downloaded successfully",
    });
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
      <OnboardingTour runTour={runTour} onComplete={handleTourComplete} />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PromptChain-X
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {nodes.length === 0 && (
              <Button
                onClick={loadDemoWorkflow}
                variant="outline"
                size="sm"
                className="border-accent/50 text-accent hover:bg-accent/10"
                data-tour="demo"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Example
              </Button>
            )}
            <Button
              onClick={addNode}
              variant="outline"
              size="sm"
              className="border-primary/50"
              data-tour="add-agent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
            <Button
              onClick={toggleConnectMode}
              variant={isConnectMode ? "default" : "outline"}
              size="sm"
              className={isConnectMode ? "bg-accent" : ""}
              data-tour="connect-button"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Connect
            </Button>
            <Button
              onClick={() => setShowTemplates(true)}
              variant="outline"
              size="sm"
              data-tour="templates"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={saveWorkflow}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {nodes.length > 0 && (
              <>
                <Button
                  onClick={() => setShowExplainer(true)}
                  variant="outline"
                  size="sm"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Explain
                </Button>
                <Button
                  onClick={exportWorkflow}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              size="sm"
              className="bg-primary hover:bg-primary/90"
              data-tour="run-workflow"
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Running..." : "Run Workflow"}
            </Button>
            <Button
              onClick={() => setShowHowItWorks(true)}
              variant="ghost"
              size="sm"
            >
              <HelpCircle className="h-4 w-4" />
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

      {/* Prompt Input Bar */}
      <PromptInput 
        onGenerate={generateWorkflowFromPrompt}
        disabled={isExecuting}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative" data-tour="canvas">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            onSelectNode={handleNodeClick}
            onUpdateNode={updateNode}
            isConnectMode={isConnectMode}
            connectStart={connectStart}
            onDeleteEdge={deleteEdge}
            isExecuting={isExecuting}
          />
          
          <AgentRoleTemplates onSelectRole={handleRoleSelect} />
        </div>

        {showTemplates && (
          <TemplateSelector
            onSelect={loadTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}

        <HowItWorksModal
          open={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
        />

        <WorkflowExplainer
          open={showExplainer}
          onClose={() => setShowExplainer(false)}
          nodes={nodes}
          edges={edges}
        />

        <WelcomeModal
          open={showWelcome}
          onClose={handleWelcomeClose}
          onTryExample={loadDemoWorkflow}
        />

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