import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseAuthed } from "@/lib/supabaseClient";
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
  ArrowRight,
  Save,
  Loader2,
  Lightbulb
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useVoltagentStream } from "@/hooks/useVoltagentStream";
import { saveProjectIdeas, type ProjectIdea as ProjectIdeaData, type ProjectIdeasResponse } from "@/lib/projectIdeas";
import { getCompanyResearch } from "@/lib/research";
import { useToast } from "@/hooks/use-toast";

// UI display type for project ideas
interface ProjectIdeaDisplay {
  title: string;
  impact_level: "critical" | "high" | "medium" | "low";
  problem_solved: string;
  description: string;
  technologies: string[];
  time_estimate: string;
  expected_impact: string;
  skill_match_score?: number;
  portfolio_value?: string;
  implementation_approach?: string;
}

const loadingMessages = [
  "Analyzing company research...",
  "Matching your skills...",
  "Evaluating project feasibility...",
  "Generating project concepts...",
  "Ranking ideas by impact...",
  "Finalizing recommendations...",
];


export default function ProjectIdeas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdeaDisplay[]>([]);
  const [recommendationSummary, setRecommendationSummary] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "",
    avatar: clerkUser?.imageUrl || "",
  };

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ["company", id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = await getSupabaseAuthed();
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,website,one_liner,industries")
        .eq("id", id as string)
        .single();
      if (error) throw error;
      return data as { id: string; name: string; website?: string; one_liner?: string; industries?: string[] };
    },
    staleTime: 60_000,
  });

  // Check if research was passed via navigation state (from Research page)
  const location = useLocation();
  const navigationResearch = location.state?.researchData;

  // Fetch latest company research from database as fallback
  const { data: savedResearchData, isLoading: isLoadingResearch } = useQuery({
    queryKey: ["company-research", id, clerkUser?.id],
    enabled: !!id && !!clerkUser?.id && !navigationResearch,
    queryFn: async () => {
      const research = await getCompanyResearch(clerkUser!.id, id as string);
      return research.length > 0 ? research[0] : null;
    },
    staleTime: 60_000,
  });

  // Use navigation research first, fallback to saved research
  const researchData = navigationResearch || savedResearchData;

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", clerkUser?.id],
    enabled: !!clerkUser?.id,
    queryFn: async () => {
      const supabase = await getSupabaseAuthed();
      const { data, error } = await supabase
        .from("users")
        .select("skills,career_interests,target_roles")
        .eq("user_id", clerkUser!.id)
        .single();
      if (error) throw error;
      return data as { skills: string[]; career_interests?: string[]; target_roles?: string[] };
    },
    staleTime: 60_000,
  });

  // VoltAgent streaming integration
  const userId = clerkUser?.id || "";
  type ProjectGeneratorCompanyResearch = {
    business_intelligence?: unknown;
    technical_landscape?: unknown;
    key_people?: unknown;
    community_feedback?: Record<string, unknown>;
    opportunity_signals?: unknown;
    pain_points_summary: Array<{ problem: string; severity: "critical" | "high" | "medium" | "low"; evidence: string; potential_solution: string }>;
  };

  const { start, loading, error, chunks, metadata, done } = useVoltagentStream<
    {
      companyId: string;
      companyName: string;
      companyResearch: ProjectGeneratorCompanyResearch;
      userProfile: {
        skills: string[];
        careerInterests?: string[];
        targetRoles?: string[];
      };
      githubUrl?: string;
    },
    Partial<ProjectIdeasResponse>
  >({
    endpoint: 'project-generator',
    userId,
    buildInput: () => ({
      companyId: id || "",
      companyName: company?.name || "Unknown Company",
      companyResearch: {
        business_intelligence: researchData?.business_intelligence || researchData?.business_intel,
        technical_landscape: researchData?.technical_landscape,
        key_people: researchData?.key_people,
        community_feedback: researchData?.community_feedback || {},
        opportunity_signals: researchData?.opportunity_signals,
        pain_points_summary: researchData?.pain_points_summary || researchData?.pain_points || [],
      },
      userProfile: {
        skills: userProfile?.skills || [],
        careerInterests: userProfile?.career_interests,
        targetRoles: userProfile?.target_roles,
      },
    }),
  });

  // Update project ideas when streaming completes
  useEffect(() => {
    if (done && chunks.length > 0) {
      // Merge all chunks into final result
      const finalData = chunks.reduce((acc, chunk) => {
        return { ...acc, ...chunk };
      }, {} as ProjectIdeasResponse);
      
      if (finalData.project_ideas?.ideas) {
        setProjectIdeas(finalData.project_ideas.ideas);
        setRecommendationSummary(finalData.recommendation_summary || "");
      }
    }
  }, [done, chunks]);

  // Loading message rotation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const getImpactColor = (impact: string): "destructive" | "default" | "secondary" => {
    switch (impact) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleGenerate = async () => {
    if (!researchData) {
      toast({
        title: "Research Required",
        description: "Please generate company research first before creating project ideas.",
        variant: "destructive",
      });
      navigate(`/research/${id}`);
      return;
    }
    
    if (!userProfile || !userProfile.skills || userProfile.skills.length === 0) {
      toast({
        title: "Profile Incomplete",
        description: "Please add your skills in your profile to get personalized project ideas.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    await start();
  };

  const handleSaveIdeas = async () => {
    if (!userId || !id || projectIdeas.length === 0) return;

    setIsSaving(true);
    try {
      const resourceId = metadata?.resourceId || `project-ideas:${id}:${userId}`;
      
      const result = await saveProjectIdeas(
        userId,
        id,
        projectIdeas,
        resourceId
      );

      toast({
        title: "Ideas Saved",
        description: `Successfully saved ${result.ids.length} project ideas`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save ideas";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectProject = (ideaIndex: number) => {
    navigate(`/add-project?companyId=${id}&projectIdeaIndex=${ideaIndex}`);
  };

  // Show loading state during data fetching
  if (isLoadingResearch || !clerkUser) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user} />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading screen during generation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Generating Project Ideas</h2>
            <p className="text-muted-foreground">{loadingMessages[currentMessageIndex]}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            This typically takes 20-40 seconds
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} currentPage="discover" />
      
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
                AI-generated projects tailored to your skills
              </p>
            </div>
            <div className="flex gap-2">
              {projectIdeas.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleSaveIdeas}
                  disabled={isSaving || loading}
                  className="shrink-0"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Ideas'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={loading}
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {projectIdeas.length > 0 ? 'Regenerate' : 'Generate Ideas'}
              </Button>
            </div>
          </div>
          {error && (
            <Card className="p-4 border-destructive bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}
        </div>

        {/* Recommendation Summary */}
        {recommendationSummary && projectIdeas.length > 0 && (
          <Card className="p-6 bg-primary/5 border-primary">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Top Recommendation</h3>
                <p className="text-muted-foreground">{recommendationSummary}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && projectIdeas.length === 0 && (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Ready to Generate Project Ideas</h2>
            <p className="text-muted-foreground mb-4">
              Click "Generate Ideas" to create personalized project recommendations based on company research and your skills
            </p>
            {!researchData && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-destructive">
                  ⚠️ No company research found.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please go back to the Research page and generate research first, then click "Generate Project Ideas".
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/research/${id}`)}
                  className="mt-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Research
                </Button>
              </div>
            )}
            {researchData && (
              <Button onClick={handleGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Project Ideas
              </Button>
            )}
          </Card>
        )}

        {/* Project Cards */}
        <div className="space-y-6">
          {projectIdeas.map((project, index) => (
            <Card 
              key={index} 
              className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getImpactColor(project.impact_level)} className="uppercase">
                      {project.impact_level} Impact
                    </Badge>
                    {project.skill_match_score && (
                      <Badge variant="outline">
                        {project.skill_match_score}% Skill Match
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Solves: <span className="font-medium text-foreground">{project.problem_solved}</span>
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

                {/* Implementation Approach */}
                {project.implementation_approach && (
                  <div>
                    <h3 className="font-semibold mb-2">Implementation Roadmap</h3>
                    <p className="text-muted-foreground text-sm">{project.implementation_approach}</p>
                  </div>
                )}

                {/* Time & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Time Investment</h3>
                      <p className="text-muted-foreground">{project.time_estimate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm">Expected Impact</h3>
                      <p className="text-muted-foreground italic">"{project.expected_impact}"</p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Value */}
                {project.portfolio_value && (
                  <div className="bg-accent/50 rounded-md p-3">
                    <h3 className="font-semibold text-sm mb-1">Portfolio Value</h3>
                    <p className="text-sm">{project.portfolio_value}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button 
                  onClick={() => handleSelectProject(index)}
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
        {projectIdeas.length > 0 && (
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
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 md:flex-none"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate Ideas
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
        )}
      </div>
    </div>
  );
}