import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Save
} from "lucide-react";

const loadingMessages = [
  "Analyzing company data...",
  "Scanning GitHub repositories...",
  "Identifying pain points...",
  "Researching recent activity...",
  "Evaluating technical landscape...",
  "Generating insights...",
];

// Mock data - in production this would come from AI analysis
const mockResearchData = {
  businessIntelligence: {
    funding: "$15M Series A led by Sequoia Capital",
    investors: ["Sequoia Capital", "Y Combinator", "A16Z"],
    growth: "300% YoY revenue growth",
    customers: ["Stripe", "Notion", "Linear"],
    marketPosition: "Leading AI-powered developer tools platform with 50K+ active users"
  },
  technicalLandscape: {
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker"],
    githubActivity: "High activity - 150+ commits/month across 12 active repos",
    painPoints: [
      {
        title: "Scaling Issues with Real-time Collaboration",
        severity: "high",
        description: "Multiple GitHub issues (#234, #189) mention performance degradation with 10+ concurrent users"
      },
      {
        title: "Mobile Responsiveness Gaps",
        severity: "medium",
        description: "Community requests for better mobile experience, currently desktop-first"
      },
      {
        title: "API Rate Limiting Challenges",
        severity: "high",
        description: "Recent issues show third-party API rate limits causing user friction"
      }
    ],
    recentReleases: [
      "v2.3.0 - AI-powered code suggestions (2 weeks ago)",
      "v2.2.5 - Performance improvements (1 month ago)"
    ]
  },
  keyPeople: [
    {
      name: "Sarah Chen",
      role: "CTO & Co-founder",
      interests: ["ML infrastructure", "Developer experience"],
      recentActivity: "Speaking at React Conf 2025"
    },
    {
      name: "Marcus Rodriguez",
      role: "VP of Engineering",
      interests: ["System architecture", "Team scaling"],
      recentActivity: "Hiring for 5 senior positions"
    },
    {
      name: "Emily Park",
      role: "Head of Product",
      interests: ["User research", "Product-market fit"],
      recentActivity: "Published article on AI in developer tools"
    }
  ],
  opportunitySignals: [
    {
      signal: "Active Hiring",
      description: "5 open engineering positions posted this month",
      urgency: "high"
    },
    {
      signal: "Recent Funding",
      description: "Series A closed 3 months ago - expansion phase",
      urgency: "high"
    },
    {
      signal: "Technical Challenges",
      description: "Public GitHub issues show scaling pain points",
      urgency: "medium"
    },
    {
      signal: "Conference Presence",
      description: "CTO speaking at major conferences - raising visibility",
      urgency: "medium"
    }
  ],
  painPointsSummary: [
    {
      problem: "Real-time collaboration performance at scale",
      severity: "critical",
      evidence: "15+ GitHub issues, 50+ user complaints on Twitter",
      potential: "Build WebSocket optimization solution or caching layer"
    },
    {
      problem: "API rate limiting causing user friction",
      severity: "critical",
      evidence: "Issues #234, #189, user support tickets",
      potential: "Create intelligent rate limit management system"
    },
    {
      problem: "Mobile experience significantly lags desktop",
      severity: "high",
      evidence: "Customer feedback, low mobile engagement metrics",
      potential: "Design and prototype mobile-first component library"
    },
    {
      problem: "Onboarding complexity for new users",
      severity: "medium",
      evidence: "Community forum discussions, support load",
      potential: "Build interactive tutorial or guided setup experience"
    }
  ]
};

export default function Research() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [researchData, setResearchData] = useState<typeof mockResearchData | null>(null);

  useEffect(() => {
    // Simulate loading with rotating messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 5000);

    // Simulate research generation (30-60 seconds)
    const loadingTimeout = setTimeout(() => {
      setResearchData(mockResearchData);
      setIsLoading(false);
      clearInterval(messageInterval);
    }, 8000); // Using 8 seconds for demo, would be 30-60 in production

    return () => {
      clearInterval(messageInterval);
      clearTimeout(loadingTimeout);
    };
  }, []);

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

  if (isLoading) {
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

  if (!researchData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/company/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Company
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">Deep Research Report</h1>
            <p className="text-muted-foreground">
              AI-generated analysis to help you identify opportunities
            </p>
          </div>
        </div>

        {/* Section 1: Business Intelligence */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Business Intelligence</h2>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Recent Funding</h3>
              <p className="text-muted-foreground">{researchData.businessIntelligence.funding}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Investors</h3>
              <div className="flex flex-wrap gap-2">
                {researchData.businessIntelligence.investors.map((investor) => (
                  <Badge key={investor} variant="secondary">{investor}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Growth Trajectory</h3>
              <p className="text-muted-foreground">{researchData.businessIntelligence.growth}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Notable Customers</h3>
              <div className="flex flex-wrap gap-2">
                {researchData.businessIntelligence.customers.map((customer) => (
                  <Badge key={customer} variant="outline">{customer}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Market Position</h3>
              <p className="text-muted-foreground">{researchData.businessIntelligence.marketPosition}</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Technical Landscape */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Technical Landscape</h2>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {researchData.technicalLandscape.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">GitHub Activity</h3>
              <p className="text-muted-foreground">{researchData.technicalLandscape.githubActivity}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-destructive">Technical Pain Points</h3>
              <div className="space-y-3">
                {researchData.technicalLandscape.painPoints.map((pain, idx) => (
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
            <div>
              <h3 className="font-semibold mb-2">Recent Technical Releases</h3>
              <ul className="space-y-1">
                {researchData.technicalLandscape.recentReleases.map((release, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">• {release}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Section 3: Key People */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Key People</h2>
          </div>
          <Separator />
          <div className="grid gap-4">
            {researchData.keyPeople.map((person, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <div>
                    <span className="text-sm font-medium">Interests: </span>
                    <span className="text-sm text-muted-foreground">
                      {person.interests.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Recent Activity: </span>
                    <span className="text-sm text-muted-foreground">{person.recentActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 4: Opportunity Signals */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Opportunity Signals</h2>
          </div>
          <Separator />
          <div className="grid gap-3">
            {researchData.opportunitySignals.map((signal, idx) => (
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

        {/* Section 5: Pain Points Summary (Most Important) */}
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
            {researchData.painPointsSummary.map((pain, idx) => (
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
                    <span className="text-sm">{pain.potential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/company/${id}`)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Company
          </Button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Research
            </Button>
            
            <Button
              onClick={() => navigate(`/projects/${id}`)}
              className="flex-1 sm:flex-none"
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