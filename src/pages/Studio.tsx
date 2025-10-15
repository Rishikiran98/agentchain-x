import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Network, Play, LogOut, Plus, Link2, Save, FolderOpen, HelpCircle, Sparkles, Wand2, Settings } from "lucide-react";
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
import SimpleMode from "@/components/SimpleMode";
import WorkflowManagement from "@/components/WorkflowManagement";
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
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [showWorkflowManagement, setShowWorkflowManagement] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user prefers advanced mode
    const preferredMode = localStorage.getItem('preferredMode');
    if (preferredMode === 'advanced') {
      setIsSimpleMode(false);
    }
    
    // Check if user has seen welcome modal (only for simple mode)
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && isSimpleMode) {
      setTimeout(() => setShowWelcome(true), 500);
    }
    
    // Check if user has seen tour (only for advanced mode)
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && hasSeenWelcome && !isSimpleMode) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, [isSimpleMode]);

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

  const switchToAdvanced = () => {
    setIsSimpleMode(false);
    localStorage.setItem('preferredMode', 'advanced');
    toast({
      title: "Advanced Mode",
      description: "Full workflow builder unlocked",
    });
  };

  const switchToSimple = () => {
    setIsSimpleMode(true);
    localStorage.setItem('preferredMode', 'simple');
    toast({
      title: "Simple Mode",
      description: "Back to effortless creation",
    });
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
      console.error('Workflow generation error:', error);
      
      let errorMessage = "Could not generate workflow. Try again or use a template.";
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes('credits') || error.message?.includes('Payment')) {
        errorMessage = "AI credits depleted. Please add credits to continue.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Generation failed",
        description: errorMessage,
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
      console.error('Workflow execution error:', error);
      
      let errorMessage = "Could not execute workflow. Please try again.";
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes('credits') || error.message?.includes('Payment')) {
        errorMessage = "AI credits depleted. Please add credits to continue.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Execution failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (isSimpleMode) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Simple Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Wand2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PromptChain-X
              </h1>
            </div>
            <div className="flex items-center gap-2">
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

        <SimpleMode onSwitchToAdvanced={switchToAdvanced} />

        <WelcomeModal
          open={showWelcome}
          onClose={handleWelcomeClose}
          onTryExample={loadDemoWorkflow}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <OnboardingTour runTour={runTour} onComplete={handleTourComplete} />
      
      {/* Simplified Advanced Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Network className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-xl font-bold">PromptChain-X</h1>
              <p className="text-xs text-muted-foreground">Visual Workflow Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={switchToSimple}
              variant="ghost"
              size="sm"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Back to Simple
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            {nodes.length === 0 && (
              <Button
                onClick={loadDemoWorkflow}
                variant="default"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Load Example
              </Button>
            )}
            {nodes.length > 0 && (
              <>
                <Button
                  onClick={executeWorkflow}
                  disabled={isExecuting || nodes.length === 0}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? "Running..." : "Run Workflow"}
                </Button>
                <Button
                  onClick={saveWorkflow}
                  variant="outline"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
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

      {/* Step-by-Step Guide */}
      {nodes.length === 0 ? (
        <div className="border-b border-border bg-accent/5 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start Your Workflow
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Create AI agent teams in 3 ways:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-primary font-semibold mb-2">1. Describe it</div>
                <p className="text-xs text-muted-foreground">Type what you want below and we'll build it</p>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-primary font-semibold mb-2">2. Load Example</div>
                <p className="text-xs text-muted-foreground">Start with a pre-built template</p>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-primary font-semibold mb-2">3. Build Custom</div>
                <p className="text-xs text-muted-foreground">Add agents manually below</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-border bg-card/50 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {nodes.length}
                </div>
                <span className="text-sm text-muted-foreground">Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                  {edges.length}
                </div>
                <span className="text-sm text-muted-foreground">Connections</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={addNode}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
              <Button
                onClick={toggleConnectMode}
                variant={isConnectMode ? "default" : "outline"}
                size="sm"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {isConnectMode ? "Connecting..." : "Connect"}
              </Button>
              <Button
                onClick={() => setShowWorkflowManagement(true)}
                variant="outline"
                size="sm"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                My Workflows
              </Button>
              <Button
                onClick={() => setShowTemplates(true)}
                variant="outline"
                size="sm"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Input Bar */}
      <PromptInput 
        onGenerate={generateWorkflowFromPrompt}
        disabled={isExecuting}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative" data-tour="canvas">
          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <Network className="h-16 w-16 mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Your Canvas is Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want in the text box above, or click "Load Example" to see how it works
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {showWorkflowManagement && (
          <WorkflowManagement
            onLoadWorkflow={(workflow) => {
              setNodes(workflow.nodes as any);
              setEdges(workflow.edges as any);
              setCurrentWorkflowId(workflow.id);
              setLoadedTemplateId(null);
              toast({
                title: "Workflow loaded",
                description: workflow.title,
              });
            }}
            onClose={() => setShowWorkflowManagement(false)}
          />
        )}

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
        {nodes.length > 0 && (
          <div className="w-96 border-l border-border bg-card/50 flex flex-col">
            {selectedNode ? (
              <NodeEditor
                node={selectedNode}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                onDelete={() => deleteNode(selectedNode.id)}
              />
            ) : currentRunId ? (
              <ExecutionPanel runId={currentRunId} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-3">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <div>
                    <h3 className="font-semibold mb-1">Configure Your Agents</h3>
                    <p className="text-xs text-muted-foreground">
                      Click any agent on the canvas to edit its role, prompt, and settings
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;