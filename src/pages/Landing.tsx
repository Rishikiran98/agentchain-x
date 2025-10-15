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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">No coding. No complexity. Just ideas.</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Tell us what you want.<br/>Watch AI make it happen.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Type your idea in plain English. PromptChain-X instantly creates a team of AI agents who collaborate to bring it to life.
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
            No workflow building. No configuration. Just natural conversation with intelligent AI collaborators.
          </p>
          
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white shadow-lg text-lg px-8 py-6"
              style={{ boxShadow: 'var(--glow-primary)' }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Try It Free
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Watch your first AI team in action in 60 seconds
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          From Idea to Result in <span className="text-primary">Three Steps</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Say What You Want</h3>
            <p className="text-muted-foreground">
              "Help me write a business plan for a food delivery app"
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Watch It Happen</h3>
            <p className="text-muted-foreground">
              AI agents research, strategize, and collaborate in real-time
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Your Result</h3>
            <p className="text-muted-foreground">
              Receive a complete, polished deliverable in seconds
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-all">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Effortless by Default</h3>
            <p className="text-muted-foreground">
              Simple mode handles everything automatically. No workflow building, no configuration, no learning curve. Just describe and receive.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced When You Need It</h3>
            <p className="text-muted-foreground">
              Want more control? Switch to advanced mode to customize agents, edit workflows, and fine-tune every detail.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl font-bold mb-4">Experience the Magic</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Watch AI agents collaborate to bring your ideas to life. 
            From concept to completion in seconds, not hours.
          </p>
          <Link to="/auth">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating for Free
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Join thousands creating with AI • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;