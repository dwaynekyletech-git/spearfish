import { useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plus,
  Share2,
  ExternalLink,
  Github,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  title: string;
  companyId: number;
  companyName: string;
  companyLogo: string;
  description: string;
  problemSolved: string;
  technologies: string[];
  demoLink?: string;
  githubLink?: string;
  outcome: "no-response" | "interview" | "hired" | null;
  isPublic: boolean;
}

const Portfolio = () => {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<"all" | "no-response" | "interview" | "hired">("all");

  // Mock data - would come from backend in real app
  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const allProjects: Project[] = [
    {
      id: 1,
      title: "Medical Image Classifier",
      companyId: 1,
      companyName: "PathAI",
      companyLogo: "",
      description: "Built a deep learning model to classify medical images with 94% accuracy, reducing diagnosis time by 40%.",
      problemSolved: "Slow manual image analysis process",
      technologies: ["Python", "TensorFlow", "React", "FastAPI"],
      demoLink: "https://demo.example.com",
      githubLink: "https://github.com/example/medical-classifier",
      outcome: "interview",
      isPublic: true,
    },
    {
      id: 2,
      title: "Compliance Automation Dashboard",
      companyId: 2,
      companyName: "Vanta",
      companyLogo: "",
      description: "Created an automated compliance monitoring system that reduced manual checks by 60%.",
      problemSolved: "Time-consuming manual compliance tracking",
      technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
      demoLink: "https://demo2.example.com",
      githubLink: "https://github.com/example/compliance-dashboard",
      outcome: "no-response",
      isPublic: true,
    },
    {
      id: 3,
      title: "Expense Processing Pipeline",
      companyId: 3,
      companyName: "Ramp",
      companyLogo: "",
      description: "Developed a real-time expense processing system handling 10k+ transactions per minute.",
      problemSolved: "Slow batch processing of expenses",
      technologies: ["Go", "Kafka", "Redis", "React"],
      githubLink: "https://github.com/example/expense-pipeline",
      outcome: "hired",
      isPublic: true,
    },
  ];

  const filteredProjects = allProjects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.outcome === activeFilter;
  });

  const projectCounts = {
    all: allProjects.length,
    "no-response": allProjects.filter((p) => p.outcome === "no-response").length,
    interview: allProjects.filter((p) => p.outcome === "interview").length,
    hired: allProjects.filter((p) => p.outcome === "hired").length,
  };

  const getOutcomeBadge = (outcome: Project["outcome"]) => {
    if (!outcome) return null;
    
    const configs = {
      "no-response": { label: "No Response", variant: "secondary" as const },
      interview: { label: "Interview", variant: "default" as const },
      hired: { label: "Hired", variant: "default" as const },
    };

    const config = configs[outcome];
    return (
      <Badge variant={config.variant} className={outcome === "hired" ? "bg-primary" : outcome === "interview" ? "bg-accent" : ""}>
        {config.label}
      </Badge>
    );
  };

  const handleSharePortfolio = () => {
    const portfolioUrl = `${window.location.origin}/portfolio/${user.name.toLowerCase().replace(/\s+/g, "-")}`;
    navigator.clipboard.writeText(portfolioUrl);
    toast({
      title: "Portfolio link copied!",
      description: "Share your portfolio with companies and recruiters.",
    });
  };

  const handleDeleteProject = (projectId: number) => {
    // Would call API to delete project
    toast({
      title: "Project deleted",
      description: "Your project has been removed from your portfolio.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} currentPage="portfolio" />

      <main className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-foreground uppercase tracking-tight">
              My Projects
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Showcase your work and track outcomes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSharePortfolio}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Portfolio
            </Button>
            <Button onClick={() => window.location.href = "/add-project"}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Button>
          </div>
        </div>

        {allProjects.length === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">No projects yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start by researching a company and building a project to solve their problems
                </p>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Link to="/discover">
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Companies
                  </Button>
                </Link>
                <Link to="/add-project">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as "all" | "no-response" | "interview" | "hired")}>
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="all" className="font-semibold">
                  All Projects
                  <Badge variant="secondary" className="ml-2">
                    {projectCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="no-response" className="font-semibold">
                  No Response
                  <Badge variant="secondary" className="ml-2">
                    {projectCounts["no-response"]}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="interview" className="font-semibold">
                  Interview
                  <Badge variant="secondary" className="ml-2">
                    {projectCounts.interview}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="hired" className="font-semibold">
                  Hired
                  <Badge variant="secondary" className="ml-2">
                    {projectCounts.hired}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Project Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:border-primary transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {project.companyName}
                          </p>
                        </div>
                      </div>
                      {getOutcomeBadge(project.outcome)}
                    </div>
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {project.demoLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.githubLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github className="w-3 h-3 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Link to={`/add-project?edit=${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Portfolio;
