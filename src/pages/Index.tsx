import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Search, Code, Send, TrendingDown, Users, FileX, Zap, Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black text-foreground uppercase tracking-tight">SpearfishIn AI</span>
          </div>
          <Button variant="glow" size="default">Get Started</Button>
        </div>
      </header>

      {/* Hero Section - Asymmetric, Bold */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10"></div>
        <div className="container mx-auto px-4 py-24 lg:py-32 max-w-7xl relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-primary">AI-Powered Job Hunting</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tighter">
                BUILD YOUR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-[hsl(var(--primary-glow))] to-accent">
                  WAY IN
                </span>
              </h1>
              
              <p className="text-2xl lg:text-3xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                Stop sending hundreds of applications. Start building solutions that get you hired.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Button variant="glow" size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">Watch Demo</Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-foreground">2,000+ developers</div>
                  <div className="text-muted-foreground">landed jobs this way</div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src={heroImage} 
                  alt="Person working on tech projects with startup logos" 
                  className="w-full border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))] group-hover:translate-x-2 group-hover:translate-y-[-8px] transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Bento Grid Style */}
      <section className="py-24 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary border-2 border-primary mb-6">
              <Zap className="w-5 h-5 text-primary-foreground" />
              <span className="text-sm font-bold uppercase tracking-wider text-primary-foreground">The Problem</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black leading-tight max-w-4xl">
              The Tech Job Market is 
              <span className="text-primary"> Completely Broken</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background text-foreground p-10 border-4 border-destructive relative overflow-hidden group hover:translate-y-[-8px] transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 -rotate-12 group-hover:rotate-12 transition-transform"></div>
              <Users className="w-16 h-16 text-destructive mb-6" />
              <div className="text-7xl font-black text-foreground mb-2">500+</div>
              <div className="text-2xl font-bold text-foreground mb-3">Applicants Per Role</div>
              <p className="text-muted-foreground text-lg">
                Your resume drowns in an ocean of applications
              </p>
            </div>

            <div className="bg-background text-foreground p-10 border-4 border-warning relative overflow-hidden group hover:translate-y-[-8px] transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rotate-12 group-hover:-rotate-12 transition-transform"></div>
              <TrendingDown className="w-16 h-16 text-warning mb-6" />
              <div className="text-7xl font-black text-foreground mb-2">AI</div>
              <div className="text-2xl font-bold text-foreground mb-3">Replacing Workers</div>
              <p className="text-muted-foreground text-lg">
                Automation makes jobs scarcer at every level
              </p>
            </div>

            <div className="bg-background text-foreground p-10 border-4 border-muted relative overflow-hidden group hover:translate-y-[-8px] transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-muted/30 rotate-45 group-hover:rotate-90 transition-transform"></div>
              <FileX className="w-16 h-16 text-muted-foreground mb-6" />
              <div className="text-7xl font-black text-foreground mb-2">0%</div>
              <div className="text-2xl font-bold text-foreground mb-3">Response Rate</div>
              <p className="text-muted-foreground text-lg">
                Applications vanish into the void
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - Angular Cards */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border-2 border-accent mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wider text-accent">The Solution</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-foreground leading-tight mb-6">
              The SpearfishIn Method
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl">
              Stop fishing with a net. Start SpearfishIn with precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-primary/5">
              <div className="w-16 h-16 bg-primary flex items-center justify-center">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-2">01</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Discover</h3>
                <p className="text-muted-foreground text-base">
                  Find high-potential AI startups actively hiring in your space
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-accent/5">
              <div className="w-16 h-16 bg-accent flex items-center justify-center">
                <Search className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <div className="text-4xl font-black text-accent mb-2">02</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Research</h3>
                <p className="text-muted-foreground text-base">
                  Get AI-powered intelligence on their technical challenges
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-warning/5">
              <div className="w-16 h-16 bg-warning flex items-center justify-center">
                <Code className="w-8 h-8 text-warning-foreground" />
              </div>
              <div>
                <div className="text-4xl font-black text-warning mb-2">03</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Build</h3>
                <p className="text-muted-foreground text-base">
                  Create solutions that showcase your skills and solve their problems
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-primary/5">
              <div className="w-16 h-16 bg-primary flex items-center justify-center">
                <Send className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-2">04</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Outreach</h3>
                <p className="text-muted-foreground text-base">
                  Send personalized messages showcasing what you've built
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Dramatic */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-primary to-accent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)' }}></div>
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-12">
          <h2 className="text-6xl lg:text-8xl font-black text-background leading-[0.9]">
            Ready to Land
            <span className="block">Your Next Role?</span>
          </h2>
          <p className="text-2xl text-background/80 max-w-3xl mx-auto font-medium">
            Join 2,000+ developers who've stopped applying and started building their way into top startups
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 hover:scale-105 border-4 border-background text-xl">
              Start Building Now
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-border py-16 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-black uppercase tracking-tight">SpearfishIn AI</span>
              </div>
              <p className="text-background/70 text-lg">
                Build your way into top tech companies. No more resume black holes.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 uppercase tracking-wide">Platform</h4>
              <div className="space-y-3 text-lg">
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">How It Works</a>
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">Success Stories</a>
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 uppercase tracking-wide">Company</h4>
              <div className="space-y-3 text-lg">
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">About</a>
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">Blog</a>
                <a href="#" className="block text-background/70 hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t-2 border-background/20 text-center text-background/60 text-sm">
            © 2025 SpearfishIn AI. All rights reserved. Built for builders.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
