import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Users, TrendingUp } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onTryExample: () => void;
}

const WelcomeModal = ({ open, onClose, onTryExample }: WelcomeModalProps) => {
  const handleTryExample = () => {
    onTryExample();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to PromptChain-X 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-lg text-muted-foreground">
            <strong>Describe a goal</strong>, like "Write a product launch plan."
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">AI-Powered Teams</h3>
              <p className="text-sm text-muted-foreground">
                We'll build a team of AI agents — a Researcher, Strategist, and Writer — who collaborate to get it done.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <Zap className="h-8 w-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">Visual Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Watch agents work together on a visual canvas. Connect, configure, and orchestrate their collaboration.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <Users className="h-8 w-8 text-secondary mb-2" />
              <h3 className="font-semibold mb-1">Live Execution</h3>
              <p className="text-sm text-muted-foreground">
                See real-time conversation logs as agents discuss, analyze, and complete your task together.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Pre-built Templates</h3>
              <p className="text-sm text-muted-foreground">
                Start with ready-made workflows for common tasks like code review, content creation, or data analysis.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button 
              onClick={handleTryExample}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Try Example Workflow
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              size="lg"
            >
              Start Building
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            💡 Tip: Use the "Add Agent" button to create custom workflows, or load a template to get started quickly
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
