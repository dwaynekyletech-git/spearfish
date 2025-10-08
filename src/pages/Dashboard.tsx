import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  Plus,
  Share2,
  ExternalLink,
  Github,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Briefcase,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  title: string;
  company: {
    id: string;
    name: string;
    logo: string;
  };
  description: string;
  technologies: string[];
  demoLink?: string;
  githubLink?: string;
  outcome: "no_response" | "interview" | "hired";
  isPublic: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<"all" | "no_response" | "interview" | "hired">("all");

  // Mock data - would come from backend in real app
  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const allProjects: Project[] = [
    {
      id: 1,
      title: "Real-time Collaboration Optimizer",
      company: {
        id: "1",
        name: "PathAI",
        logo: ""
      },
      description: "Built a WebSocket connection pooling and optimization layer that intelligently manages concurrent user sessions, reducing latency by 60%.",
      technologies: ["WebSocket", "Redis", "Node.js", "React", "TypeScript"],
      demoLink: "https://demo.example.com",
      githubLink: "https://github.com/user/project",
      outcome: "interview",
      isPublic: true
    },
    {
      id: 2,
      title: "Intelligent API Rate Limit Manager",
      company: {
        id: "2",
        name: "Anthropic",
        logo: ""
      },
      description: "Created an intelligent middleware that predicts and manages API rate limits across multiple third-party services with smart retry logic.",
      technologies: ["Node.js", "TypeScript", "Bull Queue", "PostgreSQL"],
      githubLink: "https://github.com/user/rate-limiter",
      outcome: "hired",
      isPublic: true
    },
    {
      id: 3,
      title: "Mobile-First Component Library",
      company: {
        id: "3",
        name: "Scale AI",
        logo: ""
      },
      description: "Designed and built a comprehensive mobile-first component library with touch-optimized interactions and responsive layouts.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Vite"],
      demoLink: "https://storybook.example.com",
      githubLink: "https://github.com/user/components",
      outcome: "no_response",
      isPublic: true
    }
  ];

  const filteredProjects = activeFilter === "all" 
    ? allProjects 
    : allProjects.filter(p => p.outcome === activeFilter);

  const projectCounts = {
    all: allProjects.length,
    no_response: allProjects.filter(p => p.outcome === "no_response").length,
    interview: allProjects.filter(p => p.outcome === "interview").length,
    hired: allProjects.filter(p => p.outcome === "hired").length,
  };

  const getOutcomeBadge = (outcome: Project["outcome"]) => {
    switch (outcome) {
      case "hired":
        return { label: "Hired", variant: "default" as const, icon: CheckCircle2 };
      case "interview":
        return { label: "Interview", variant: "default" as const, icon: MessageSquare };
      case "no_response":
        return { label: "No Response", variant: "secondary" as const, icon: Clock };
    }
  };

  const handleSharePortfolio = () => {
    const portfolioUrl = `${window.location.origin}/portfolio/${user.name.toLowerCase().replace(" ", "-")}`;
    navigator.clipboard.writeText(portfolioUrl);
    toast({
      title: "Portfolio Link Copied!",
      description: "Your public portfolio link has been copied to clipboard",
    });
  };

  const handleDeleteProject = (projectId: number) => {
    // In production, call API to delete
    toast({
      title: "Project Deleted",
      description: "The project has been removed from your portfolio",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-black text-foreground uppercase tracking-tight">
                Spearfish AI
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/discover"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Browse Companies
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-primary transition-colors uppercase tracking-wide"
              >
                My Projects
              </Link>
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Your portfolio of work showcasing what you've built
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleSharePortfolio}
              className="flex-1 sm:flex-none"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Portfolio
            </Button>
            <Button
              onClick={() => navigate("/add-project")}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        {allProjects.length > 0 && (
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="relative">
                All Projects
                <Badge variant="secondary" className="ml-2">
                  {projectCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="no_response" className="relative">
                No Response
                <Badge variant="secondary" className="ml-2">
                  {projectCounts.no_response}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="interview" className="relative">
                Interview
                <Badge variant="secondary" className="ml-2">
                  {projectCounts.interview}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="hired" className="relative">
                Hired
                <Badge variant="secondary" className="ml-2">
                  {projectCounts.hired}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const outcome = getOutcomeBadge(project.outcome);
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground shrink-0">
                          {project.company.logo || project.company.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.company.name}</p>
                        </div>
                      </div>
                      <Badge variant={outcome.variant} className="shrink-0">
                        <outcome.icon className="h-3 w-3 mr-1" />
                        {outcome.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Links */}
                    {(project.demoLink || project.githubLink) && (
                      <div className="flex gap-2">
                        {project.demoLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a
                              href={project.demoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Demo
                            </a>
                          </Button>
                        )}
                        {project.githubLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-3 w-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/edit-project/${project.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start by researching a company and building a project that solves their specific problems
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/discover")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Companies
                </Button>
                <Button onClick={() => navigate("/add-project")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
