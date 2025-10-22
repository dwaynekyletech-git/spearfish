import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseAuthed } from "@/lib/supabaseClient";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Building2, 
  Code2, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ArrowLeft,
  Lightbulb,
  Save,
  Sparkles,
  MessageSquare
} from "lucide-react";

import { useVoltagentStream } from "@/hooks/useVoltagentStream";
import { saveCompanyResearch, type CompanyResearchData } from "@/lib/research";
import { useToast } from "@/hooks/use-toast";

// Types matching CompanyResearchSchema from VoltAgent
interface BusinessIntelligence {
  funding: string;
  investors: string[];
  growth_metrics: string;
  customers: string[];
  market_position: string;
}

interface TechnicalPainPoint {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

interface TechnicalLandscape {
  tech_stack: string[];
  github_activity: string;
  pain_points: TechnicalPainPoint[];
  recent_releases: string[];
}

interface KeyPerson {
  name: string;
  role: string;
  interests: string[];
  recent_activity: string;
}

interface CommunityFeedback {
  pain_points: string[];
  product_gaps: string[];
  missing_features: string[];
  user_workarounds: string[];
}

interface OpportunitySignal {
  signal: string;
  description: string;
  urgency: "high" | "medium" | "low";
}

interface PainPointSummaryItem {
  problem: string;
  severity: "critical" | "high" | "medium" | "low";
  evidence: string;
  potential_solution: string;
}

interface CompanyResearch {
  business_intelligence: BusinessIntelligence;
  technical_landscape: TechnicalLandscape;
  key_people: KeyPerson[];
  community_feedback: CommunityFeedback;
  opportunity_signals: OpportunitySignal[];
  pain_points_summary: PainPointSummaryItem[];
}

const loadingMessages = [
  "Analyzing company data...",
  "Scanning GitHub repositories...",
  "Identifying pain points...",
  "Researching recent activity...",
  "Evaluating technical landscape...",
  "Generating insights...",
];

export default function Research() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [researchData, setResearchData] = useState<CompanyResearch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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
        .select("id,name,website,github,app_answers")
        .eq("id", id as string)
        .single();
      if (error) throw error;
      return data as { id: string; name: string; website?: string; github?: { repositories?: Array<Record<string, unknown>> } | null; app_answers?: { github?: { repositories?: Array<Record<string, unknown>> } } | null };
    },
    staleTime: 60_000,
  });

  // Extract GitHub URL from repositories array
  const getGithubUrl = () => {
    // Try company.github first, then app_answers.github
    const githubData = company?.github || company?.app_answers?.github;
    const repos = githubData?.repositories;
    
    if (!Array.isArray(repos) || repos.length === 0) {
      return null;
    }
    
    // Get the most starred repository, or the first one
    const primaryRepo = repos.reduce((best, current) => {
      const bestStars = best?.stargazers_count || best?.stars || 0;
      const currentStars = current?.stargazers_count || current?.stars || 0;
      return currentStars > bestStars ? current : best;
    }, repos[0]);
    
    // Convert full_name to GitHub URL (e.g., "openai/gpt-3" -> "https://github.com/openai/gpt-3")
    return primaryRepo?.full_name ? `https://github.com/${primaryRepo.full_name}` : null;
  };
  
  const githubUrl = getGithubUrl();

  // AI integration with real user ID
  const userId = clerkUser?.id || "";
  const { start, loading, error, chunks, metadata, done } = useVoltagentStream<{ companyId: string; companyName: string; githubUrl?: string }, Partial<CompanyResearch>>({
    endpoint: 'research',
    userId,
    buildInput: () => ({
      companyId: id || "",
      companyName: company?.name || "Unknown Company",
      githubUrl: githubUrl || undefined,
    }),
  });

  // Update research data when streaming is done
  useEffect(() => {
    if (done && chunks.length > 0) {
      // Merge all chunks into final research data
      const finalData = chunks.reduce((acc, chunk) => {
        return { ...acc, ...chunk };
      }, {} as CompanyResearch);
      setResearchData(finalData);
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

  const getSeverityColor = (severity: string): "destructive" | "secondary" | "outline" => {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleSaveResearch = async () => {
    if (!researchData || !id || !userId) return;

    setIsSaving(true);
    try {
      const resourceId = metadata?.resourceId || `company-research:${id}`;
      
      const result = await saveCompanyResearch(
        userId,
        id,
        researchData as CompanyResearchData,
        resourceId
      );

      toast({
        title: "Research Saved",
        description: `Successfully saved research${result.conversationId ? ' and linked to conversation' : ''}`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save research";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Generating Deep Research</h2>
            <p className="text-muted-foreground">{loadingMessages[currentMessageIndex]}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            This typically takes 30-60 seconds
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AppHeader user={user} />
      
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Discover", href: "/discover" },
            { label: "Company", href: `/company/${id}` },
            { label: "Research" },
          ]}
        />
        
        {/* Header */}
        <div className="space-y-4">
          <Link to={`/company/${id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Company
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Deep Research Report</h1>
            <p className="text-muted-foreground">
              AI-generated analysis to help you identify opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => start()} 
              disabled={loading || !userId || !company}
            >
              <Sparkles className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : researchData ? 'Regenerate with AI' : 'Generate Research'}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </div>

        {/* Show message if no research data yet */}
        {!researchData && !loading && (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Ready to Generate Research</h2>
            <p className="text-muted-foreground mb-4">
              Click "Generate Research" to start AI-powered analysis of this company
            </p>
          </Card>
        )}

        {/* Section 1: Business Intelligence */}
        {researchData && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Business Intelligence</h2>
            </div>
            <Separator />
            <div className="grid gap-4">
              {researchData.business_intelligence?.funding && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Funding</h3>
                  <p className="text-muted-foreground">{researchData.business_intelligence.funding}</p>
                </div>
              )}
              {researchData.business_intelligence?.investors && researchData.business_intelligence.investors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Investors</h3>
                  <div className="flex flex-wrap gap-2">
                    {researchData.business_intelligence.investors.map((investor, idx) => (
                      <Badge key={idx} variant="secondary">{investor}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {researchData.business_intelligence?.growth_metrics && (
                <div>
                  <h3 className="font-semibold mb-2">Growth Trajectory</h3>
                  <p className="text-muted-foreground">{researchData.business_intelligence.growth_metrics}</p>
                </div>
              )}
              {researchData.business_intelligence?.customers && researchData.business_intelligence.customers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Notable Customers</h3>
                  <div className="flex flex-wrap gap-2">
                    {researchData.business_intelligence.customers.map((customer, idx) => (
                      <Badge key={idx} variant="outline">{customer}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {researchData.business_intelligence?.market_position && (
                <div>
                  <h3 className="font-semibold mb-2">Market Position</h3>
                  <p className="text-muted-foreground">{researchData.business_intelligence.market_position}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Section 2: Technical Landscape */}
        {researchData && researchData.technical_landscape && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Technical Landscape</h2>
            </div>
            <Separator />
            <div className="grid gap-4">
              {researchData.technical_landscape.tech_stack && researchData.technical_landscape.tech_stack.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {researchData.technical_landscape.tech_stack.map((tech, idx) => (
                      <Badge key={idx} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {researchData.technical_landscape.github_activity && (
                <div>
                  <h3 className="font-semibold mb-2">GitHub Activity</h3>
                  <p className="text-muted-foreground">{researchData.technical_landscape.github_activity}</p>
                </div>
              )}
              {researchData.technical_landscape.pain_points && researchData.technical_landscape.pain_points.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Technical Pain Points</h3>
                  <div className="space-y-3">
                    {researchData.technical_landscape.pain_points.map((pain, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold">{pain.title}</h4>
                          <Badge variant={getSeverityColor(pain.severity)}>
                            {pain.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pain.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {researchData.technical_landscape.recent_releases && researchData.technical_landscape.recent_releases.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Technical Releases</h3>
                  <ul className="space-y-1">
                    {researchData.technical_landscape.recent_releases.map((release, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {release}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Section 3: Key People */}
        {researchData && researchData.key_people && researchData.key_people.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Key People</h2>
            </div>
            <Separator />
            <div className="grid gap-4">
              {researchData.key_people.map((person, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{person.name}</h3>
                      <p className="text-sm text-muted-foreground">{person.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    {person.interests && person.interests.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Interests: </span>
                        <span className="text-sm text-muted-foreground">
                          {person.interests.join(", ")}
                        </span>
                      </div>
                    )}
                    {person.recent_activity && (
                      <div>
                        <span className="text-sm font-medium">Recent Activity: </span>
                        <span className="text-sm text-muted-foreground">{person.recent_activity}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Section 4: Community Feedback */}
        {researchData && researchData.community_feedback && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Community Feedback</h2>
            </div>
            <Separator />
            <div className="grid gap-4">
              {researchData.community_feedback.pain_points && researchData.community_feedback.pain_points.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">User Pain Points</h3>
                  <ul className="space-y-2">
                    {researchData.community_feedback.pain_points.map((point, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {researchData.community_feedback.product_gaps && researchData.community_feedback.product_gaps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Product Gaps</h3>
                  <ul className="space-y-2">
                    {researchData.community_feedback.product_gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground border-l-2 border-accent pl-3">
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {researchData.community_feedback.missing_features && researchData.community_feedback.missing_features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Missing Features</h3>
                  <ul className="space-y-2">
                    {researchData.community_feedback.missing_features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground border-l-2 border-warning pl-3">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {researchData.community_feedback.user_workarounds && researchData.community_feedback.user_workarounds.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">User Workarounds</h3>
                  <ul className="space-y-2">
                    {researchData.community_feedback.user_workarounds.map((workaround, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded">
                        {workaround}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Section 5: Opportunity Signals */}
        {researchData && researchData.opportunity_signals && researchData.opportunity_signals.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Opportunity Signals</h2>
            </div>
            <Separator />
            <div className="grid gap-3">
              {researchData.opportunity_signals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    signal.urgency === "high" ? "text-destructive" : "text-warning"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{signal.signal}</h3>
                      <Badge 
                        variant={signal.urgency === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {signal.urgency} urgency
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{signal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Section 6: Pain Points Summary (Most Important) */}
        {researchData && researchData.pain_points_summary && researchData.pain_points_summary.length > 0 && (
          <Card className="p-6 space-y-4 border-2 border-primary">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold">Pain Points Summary</h2>
              <Badge variant="destructive" className="ml-auto">Priority Section</Badge>
            </div>
            <Separator />
            <p className="text-muted-foreground">
              These are the most actionable problems you can solve for this company
            </p>
            <div className="space-y-4">
              {researchData.pain_points_summary.map((pain, idx) => (
                <div key={idx} className="border-2 border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg">{pain.problem}</h3>
                    <Badge variant={getSeverityColor(pain.severity)}>
                      {pain.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold">Evidence: </span>
                      <span className="text-sm text-muted-foreground">{pain.evidence}</span>
                    </div>
                    <div className="bg-accent/50 rounded-md p-3">
                      <span className="text-sm font-semibold flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-accent-foreground" />
                        Project Opportunity:
                      </span>
                      <span className="text-sm">{pain.potential_solution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <Link to={`/company/${id}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Company
            </Button>
          </Link>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={handleSaveResearch}
              disabled={!researchData || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Research'}
            </Button>
            
            <Button 
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (!researchData) {
                  toast({
                    title: "No Research",
                    description: "Please generate research first",
                    variant: "destructive",
                  });
                  return;
                }
                // Navigate with research data in state
                navigate(`/projects/${id}`, { 
                  state: { 
                    researchData: {
                      business_intel: researchData.business_intelligence,
                      technical_landscape: researchData.technical_landscape,
                      key_people: researchData.key_people,
                      community_feedback: researchData.community_feedback,
                      opportunity_signals: researchData.opportunity_signals,
                      pain_points_summary: researchData.pain_points_summary, // Match server expectation
                    }
                  } 
                });
              }}
              disabled={!researchData}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Project Ideas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}