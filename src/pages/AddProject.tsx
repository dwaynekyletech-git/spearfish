import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  X, 
  ExternalLink, 
  Github,
  Save,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const techSuggestions = [
  "React", "TypeScript", "Python", "Node.js", "AWS", "Docker",
  "PostgreSQL", "MongoDB", "Next.js", "Tailwind CSS", "Vue.js",
  "GraphQL", "Redis", "TensorFlow", "PyTorch", "FastAPI"
];

const mockCompanies = [
  { id: "1", name: "PathAI" },
  { id: "2", name: "Anthropic" },
  { id: "3", name: "Scale AI" },
  { id: "4", name: "Hugging Face" },
  { id: "5", name: "Replicate" }
];

interface FormData {
  title: string;
  companyId: string;
  description: string;
  problemSolved: string;
  technologies: string[];
  demoLink: string;
  githubLink: string;
  isPublic: boolean;
}

export default function AddProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [filteredTechs, setFilteredTechs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    companyId: "",
    description: "",
    problemSolved: "",
    technologies: [],
    demoLink: "",
    githubLink: "",
    isPublic: true
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Pre-fill form from URL parameters
  useEffect(() => {
    const companyId = searchParams.get("companyId");
    const projectIdeaId = searchParams.get("projectIdeaId");

    if (companyId) {
      setFormData(prev => ({ ...prev, companyId }));
    }

    if (projectIdeaId) {
      // Mock project ideas data (should match ProjectIdeas.tsx)
      const mockProjectIdeas = [
        {
          id: "1",
          title: "Real-time Collaboration Performance Optimizer",
          description: "Build a WebSocket connection pooling and optimization layer that intelligently manages concurrent user sessions. Implements smart batching of updates and predictive caching to reduce server load and improve response times for 10+ concurrent users.",
          problemSolved: "Real-time collaboration performance at scale",
          technologies: ["WebSocket", "Redis", "Node.js", "React", "TypeScript"],
        },
        {
          id: "2",
          title: "Intelligent API Rate Limit Manager",
          description: "Create an intelligent middleware that predicts and manages API rate limits across multiple third-party services. Features include automatic request queuing, smart retry logic with exponential backoff, and real-time dashboard showing rate limit status and usage patterns.",
          problemSolved: "API rate limiting causing user friction",
          technologies: ["Node.js", "TypeScript", "Bull Queue", "PostgreSQL", "React"],
        },
        {
          id: "3",
          title: "Mobile-First Component Library",
          description: "Design and build a comprehensive mobile-first component library with touch-optimized interactions, responsive layouts, and progressive enhancement. Includes documentation, Storybook integration, and migration guides for existing components.",
          problemSolved: "Mobile experience significantly lags desktop",
          technologies: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Vite"],
        },
        {
          id: "4",
          title: "Interactive Onboarding Tutorial System",
          description: "Build a context-aware, interactive tutorial system that guides new users through key features with tooltips, highlights, and step-by-step walkthroughs. Tracks user progress and adapts content based on user behavior and role.",
          problemSolved: "Onboarding complexity for new users",
          technologies: ["React", "TypeScript", "Framer Motion", "Zustand"],
        },
        {
          id: "5",
          title: "Predictive Performance Monitoring Dashboard",
          description: "Create a real-time dashboard that monitors system performance metrics and uses ML to predict potential bottlenecks before they impact users. Features anomaly detection, automated alerts, and actionable insights.",
          problemSolved: "Lack of visibility into system performance patterns",
          technologies: ["Python", "TensorFlow", "React", "D3.js", "WebSocket"],
        },
      ];

      const selectedProject = mockProjectIdeas.find(p => p.id === projectIdeaId);
      if (selectedProject) {
        setFormData(prev => ({
          ...prev,
          title: selectedProject.title,
          description: selectedProject.description,
          problemSolved: selectedProject.problemSolved,
          technologies: selectedProject.technologies,
        }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTechInputChange = (value: string) => {
    setTechInput(value);
    if (value) {
      const filtered = techSuggestions.filter(tech => 
        tech.toLowerCase().includes(value.toLowerCase()) && 
        !formData.technologies.includes(tech)
      );
      setFilteredTechs(filtered);
    } else {
      setFilteredTechs([]);
    }
  };

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
      setTechInput("");
      setFilteredTechs([]);
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== techToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Please select a company";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.problemSolved.trim()) {
      newErrors.problemSolved = "Problem solved is required";
    }

    if (formData.technologies.length === 0) {
      newErrors.technologies = "Add at least one technology";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // In production, save to backend
    console.log("Saving project:", formData);

    // Show success dialog
    setShowSuccessDialog(true);
  };

  const handleGenerateEmail = () => {
    setShowSuccessDialog(false);
    navigate(`/email/${formData.companyId}`);
  };

  const handleGoToProjects = () => {
    setShowSuccessDialog(false);
    navigate("/portfolio");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Add Project</h1>
          <p className="text-muted-foreground">
            Document what you built and add it to your portfolio
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Real-time Collaboration Optimizer"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Company Targeted */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-1">
              Company Targeted <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange("companyId", value)}
            >
              <SelectTrigger className={errors.companyId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a company you researched" />
              </SelectTrigger>
              <SelectContent>
                {mockCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && (
              <p className="text-sm text-destructive">{errors.companyId}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Explain how your project works and what it does..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Problem It Solved */}
          <div className="space-y-2">
            <Label htmlFor="problemSolved" className="flex items-center gap-1">
              Problem It Solved <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="problemSolved"
              placeholder="What specific issue does this project address?"
              value={formData.problemSolved}
              onChange={(e) => handleInputChange("problemSolved", e.target.value)}
              className={`min-h-[100px] ${errors.problemSolved ? "border-destructive" : ""}`}
            />
            {errors.problemSolved && (
              <p className="text-sm text-destructive">{errors.problemSolved}</p>
            )}
          </div>

          {/* Technologies Used */}
          <div className="space-y-2">
            <Label htmlFor="technologies" className="flex items-center gap-1">
              Technologies Used <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="technologies"
                placeholder="Type to search or add custom technology..."
                value={techInput}
                onChange={(e) => handleTechInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && techInput) {
                    e.preventDefault();
                    addTechnology(techInput);
                  }
                }}
                className={errors.technologies ? "border-destructive" : ""}
              />
              {filteredTechs.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredTechs.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => addTechnology(tech)}
                      className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1.5">
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.technologies && (
              <p className="text-sm text-destructive">{errors.technologies}</p>
            )}
          </div>

          {/* Demo Link */}
          <div className="space-y-2">
            <Label htmlFor="demoLink" className="flex items-center gap-2">
              Demo Link
              <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="demoLink"
                type="url"
                placeholder="https://your-demo.com"
                value={formData.demoLink}
                onChange={(e) => handleInputChange("demoLink", e.target.value)}
                className="pr-10"
              />
              <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* GitHub Link */}
          <div className="space-y-2">
            <Label htmlFor="githubLink" className="flex items-center gap-2">
              GitHub Link
              <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="githubLink"
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.githubLink}
                onChange={(e) => handleInputChange("githubLink", e.target.value)}
                className="pr-10"
              />
              <Github className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Make Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="isPublic" className="text-base font-semibold cursor-pointer">
                Make Public
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Include this project in your public portfolio
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-[720px] md:max-w-[820px] p-6 overflow-hidden">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl pr-8">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Save className="h-6 w-6 text-primary" />
              </div>
              <span className="break-words">Project Saved Successfully!</span>
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Your project has been added to your portfolio. Would you like to generate an outreach email for this project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={handleGoToProjects}
              className="w-full sm:flex-1 uppercase font-semibold text-sm"
            >
              No, Go to Projects
            </Button>
            <Button
              onClick={handleGenerateEmail}
              className="w-full sm:flex-1 uppercase font-semibold text-sm justify-center"
            >
              <Sparkles className="h-4 w-4 mr-2 shrink-0" />
              Generate Outreach Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}