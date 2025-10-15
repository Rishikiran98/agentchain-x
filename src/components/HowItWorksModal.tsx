import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorksModal = ({ open, onClose }: HowItWorksModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">How PromptChain-X Works</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add Agents</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Add Agent" to create AI agents with different roles. Each agent has its own purpose and instructions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Connect Them</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Connect" and then click two agents to create arrows. This defines how information flows between agents.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Configure Each Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Click an agent to edit its role, system prompt, and model. Define what each agent should do in the workflow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Run the Workflow</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Run Workflow" to execute the chain. Agents will run in order, each building on the previous agent's output.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">5</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Watch the Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  See the full conversation unfold in the log panel below. Each agent's response builds on the previous ones.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-semibold mb-2">💡 Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Try the <span className="font-semibold text-foreground">Startup Idea Generator</span> template to see a complete example in action!
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Got it, let's build!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksModal;