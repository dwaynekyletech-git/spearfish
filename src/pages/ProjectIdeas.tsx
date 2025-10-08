import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Code2, 
  TrendingUp,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface ProjectIdea {
  id: number;
  title: string;
  impact: "high" | "medium" | "low";
  problemSolved: string;
  description: string;
  technologies: string[];
  timeEstimate: string;
  expectedImpact: string;
}

// Mock project ideas - in production these would be AI-generated
const mockProjectIdeas: ProjectIdea[] = [
  {
    id: 1,
    title: "Real-time Collaboration Performance Optimizer",
    impact: "high",
    problemSolved: "Real-time collaboration performance at scale",
    description: "Build a WebSocket connection pooling and optimization layer that intelligently manages concurrent user sessions. Implements smart batching of updates and predictive caching to reduce server load and improve response times for 10+ concurrent users.",
    technologies: ["WebSocket", "Redis", "Node.js", "React", "TypeScript"],
    timeEstimate: "2-3 weeks",
    expectedImpact: "I reduced your real-time collaboration latency by 60% and increased concurrent user capacity by 3x"
  },
  {
    id: 2,
    title: "Intelligent API Rate Limit Manager",
    impact: "high",
    problemSolved: "API rate limiting causing user friction",
    description: "Create an intelligent middleware that predicts and manages API rate limits across multiple third-party services. Features include automatic request queuing, smart retry logic with exponential backoff, and real-time dashboard showing rate limit status and usage patterns.",
    technologies: ["Node.js", "TypeScript", "Bull Queue", "PostgreSQL", "React"],
    timeEstimate: "1-2 weeks",
    expectedImpact: "I eliminated 95% of API rate limit errors and improved system reliability for your users"
  },
  {
    id: 3,
    title: "Mobile-First Component Library",
    impact: "medium",
    problemSolved: "Mobile experience significantly lags desktop",
    description: "Design and build a comprehensive mobile-first component library with touch-optimized interactions, responsive layouts, and progressive enhancement. Includes documentation, Storybook integration, and migration guides for existing components.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Vite"],
    timeEstimate: "3-4 weeks",
    expectedImpact: "I boosted your mobile engagement by 45% with an intuitive, performant mobile experience"
  },
  {
    id: 4,
    title: "Interactive Onboarding Tutorial System",
    impact: "medium",
    problemSolved: "Onboarding complexity for new users",
    description: "Build a context-aware, interactive tutorial system that guides new users through key features with tooltips, highlights, and step-by-step walkthroughs. Tracks user progress and adapts content based on user behavior and role.",
    technologies: ["React", "TypeScript", "Framer Motion", "Zustand"],
    timeEstimate: "2 weeks",
    expectedImpact: "I reduced onboarding support tickets by 70% and improved user activation by 50%"
  },
  {
    id: 5,
    title: "Predictive Performance Monitoring Dashboard",
    impact: "low",
    problemSolved: "Lack of visibility into system performance patterns",
    description: "Create a real-time dashboard that monitors system performance metrics and uses ML to predict potential bottlenecks before they impact users. Features anomaly detection, automated alerts, and actionable insights.",
    technologies: ["Python", "TensorFlow", "React", "D3.js", "WebSocket"],
    timeEstimate: "3 weeks",
    expectedImpact: "I prevented 80% of performance incidents by predicting issues 30 minutes before they occur"
  }
];

export default function ProjectIdeas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects] = useState<ProjectIdea[]>(mockProjectIdeas);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const getImpactColor = (impact: string): "destructive" | "default" | "secondary" => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate regeneration
    setTimeout(() => {
      setIsRegenerating(false);
    }, 2000);
  };

  const handleSelectProject = (projectId: number) => {
    console.log("Selected project:", projectId);
    navigate(`/add-project?companyId=${id}&projectIdeaId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentPage="discover" />
      
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Research", href: `/research/${id}` },
            { label: "Project Ideas" }
          ]}
        />
        
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/research/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Research
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Project Ideas</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                AI-generated projects that solve their specific problems
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              Generate Different Ideas
            </Button>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-6">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getImpactColor(project.impact)} className="uppercase">
                      {project.impact} Impact
                    </Badge>
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Solves: <span className="font-medium text-foreground">{project.problemSolved}</span>
                  </p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Approach</h3>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Technologies */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Technologies</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>

                {/* Time & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Time Investment</h3>
                      <p className="text-muted-foreground">{project.timeEstimate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Expected Impact</h3>
                      <p className="text-muted-foreground italic">"{project.expectedImpact}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button 
                  onClick={() => handleSelectProject(project.id)}
                  className="w-full sm:w-auto"
                >
                  Select This Project
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <Card className="p-6 bg-secondary/20 border-dashed">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-1">Not quite right?</h3>
              <p className="text-sm text-muted-foreground">
                Generate new ideas or add your own custom project
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 md:flex-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                Generate Different Ideas
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate(`/add-project?companyId=${id}`)}
                className="flex-1 md:flex-none"
              >
                Skip - I'll add my own
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}