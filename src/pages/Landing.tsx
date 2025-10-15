import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Network, Zap, Shield } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Network className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PromptChain-X
            </span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            The Agentic Workflow Studio
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Design, orchestrate, and observe intelligent multi-agent workflows. 
            Let AI agents collaborate to solve complex problems.
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white shadow-lg"
              style={{ boxShadow: 'var(--glow-primary)' }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Launch Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual Workflow Builder</h3>
            <p className="text-muted-foreground">
              Create complex agent networks with an intuitive drag-and-drop interface. 
              Design sequential or branching logic effortlessly.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-all">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Execution</h3>
            <p className="text-muted-foreground">
              Watch agents collaborate in real-time. See their reasoning, 
              communication, and outputs as they work together.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shared Memory</h3>
            <p className="text-muted-foreground">
              Agents share context through a blackboard memory system, 
              enabling sophisticated multi-step reasoning.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start designing intelligent workflows with multiple AI agents. 
            No complex setup required.
          </p>
          <Link to="/auth">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;