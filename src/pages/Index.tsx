import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Search, Code, Send, TrendingDown, Users, FileX } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Spearfish AI</span>
          </div>
          <Button size="default">Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Build Your Way In
              </h1>
              <p className="text-xl text-muted-foreground">
                Break into tech by solving real startup problems. Stop sending hundreds of applications. Start building solutions that matter.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Get Started Free</Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Person working on tech projects with startup logos" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The Tech Job Market is Broken
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Traditional job hunting doesn't work anymore. Here's why:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-4xl font-bold text-foreground">500+</h3>
              <p className="text-lg font-semibold text-foreground">Applicants Per Role</p>
              <p className="text-muted-foreground">
                Companies are overwhelmed with applications and can't review them all
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-warning/10 rounded-full flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-4xl font-bold text-foreground">AI Replacing</h3>
              <p className="text-lg font-semibold text-foreground">Workers Everywhere</p>
              <p className="text-muted-foreground">
                Automation is making jobs scarcer at every level
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <FileX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-foreground">0%</h3>
              <p className="text-lg font-semibold text-foreground">Response Rate</p>
              <p className="text-muted-foreground">
                Resumes and applications are being completely ignored
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The Spearfishing Method
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop fishing with a net. Start spearfishing with precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">1. Discover</h3>
              <p className="text-muted-foreground">
                Find high-potential AI startups that are actively hiring in your space
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">2. Research</h3>
              <p className="text-muted-foreground">
                Get AI-powered intelligence on each company's specific technical challenges
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">3. Build</h3>
              <p className="text-muted-foreground">
                Create solutions that solve their actual problems and showcase your skills
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">4. Outreach</h3>
              <p className="text-muted-foreground">
                Send personalized messages showcasing what you've built before interviewing
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Ready to Land Your Next Role?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who've stopped applying and started building their way into top startups
          </p>
          <Button size="lg" className="text-lg px-12">
            Start Building
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Spearfish AI</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">How It Works</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Spearfish AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
