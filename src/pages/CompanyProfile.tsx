import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar, Users, Briefcase, TrendingUp, CheckCircle, Github, Download, Video, Target } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Mock data - would come from API in real app
const mockCompanyData: Record<string, any> = {
  "1": {
    id: 1,
    name: "PathAI",
    slug: "pathai",
    one_liner: "AI-powered pathology diagnostics for cancer detection",
    long_description: "PathAI is developing AI-powered technology to improve the accuracy of diagnosis in pathology, starting with cancer. Our platform uses deep learning to help pathologists make faster, more accurate diagnoses, ultimately improving patient outcomes. We're working with leading academic medical centers and pharmaceutical companies to validate and deploy our technology.",
    small_logo_thumb_url: "",
    website: "https://pathai.com",
    all_locations: ["Boston, MA, USA"],
    batch: "W22",
    stage: "Series B",
    team_size: 45,
    industries: ["Healthcare", "AI"],
    launched_at: "2016-01-15T00:00:00Z",
    url: "https://www.ycombinator.com/companies/pathai",
    isHiring: true,
    // Custom Spearfish fields
    founded: "2016",
    score: 94,
    mission: "Our mission is to improve patient outcomes with AI-powered pathology. We believe that combining the expertise of pathologists with the power of machine learning will transform how cancer and other diseases are diagnosed and treated.",
    scoreBreakdown: [
      { factor: "W22 Batch - Recent and well-funded cohort", points: 25, maxPoints: 30 },
      { factor: "Series B Stage - Proven product-market fit", points: 20, maxPoints: 25 },
      { factor: "Healthcare + AI - High-impact domain", points: 18, maxPoints: 20 },
      { factor: "High GitHub activity - Active development", points: 15, maxPoints: 15 },
      { factor: "Growing team - Hiring momentum", points: 10, maxPoints: 10 },
      { factor: "Strong technical culture", points: 6, maxPoints: 10 },
    ],
    technicalSignals: {
      github: [
        { name: "pathai/slide-viewer", stars: 234, description: "Web-based pathology slide viewer" },
        { name: "pathai/ml-models", stars: 189, description: "Production ML models for pathology" },
        { name: "pathai/data-pipeline", stars: 145, description: "Image processing pipeline" },
      ],
      huggingface: [
        { name: "pathai/pathology-classifier", downloads: "12.5K", description: "Cancer detection model" },
        { name: "pathai/tissue-segmentation", downloads: "8.2K", description: "Tissue type classifier" },
      ],
      conferences: [
        { event: "NeurIPS 2024", talk: "Deep Learning for Pathology Diagnosis", speaker: "Dr. Sarah Chen" },
        { event: "CVPR 2024", talk: "Multi-modal Learning in Medical Imaging", speaker: "Dr. James Park" },
        { event: "ML4H 2023", talk: "Scaling AI for Clinical Pathology", speaker: "Dr. Sarah Chen" },
      ],
    },
  },
};

export default function CompanyProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  
  const company = mockCompanyData[id || "1"] || mockCompanyData["1"];

  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const stats = [
    { label: "Batch", value: company.batch, icon: TrendingUp },
    { label: "Stage", value: company.stage, icon: Briefcase },
    { label: "Team Size", value: `${company.team_size} people`, icon: Users },
    { label: "Founded", value: company.founded, icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} currentPage="discover" />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Discover", href: "/discover" },
              { label: company.name },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-8 mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-4">
                <div className="w-24 h-24 bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground shrink-0">
                  {company.small_logo_thumb_url || company.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-2">{company.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{company.one_liner}</p>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    {company.website.replace('https://', '')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Score Badge */}
            <Card className="shrink-0 border-primary">
              <CardContent className="p-6 text-center">
                <div className="mb-2">
                  <div className="h-24 w-24 mx-auto rounded-full border-4 border-primary flex items-center justify-center bg-background mb-2">
                    <span className="text-4xl font-bold text-primary">{company.score}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Opportunity Score</p>
                </div>
                <Badge variant="default" className="mt-2">Excellent Match</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="why-spearfish">Why Spearfish This?</TabsTrigger>
            <TabsTrigger value="technical">Technical Signals</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What They Do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{company.long_description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{company.mission}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Why Spearfish Tab */}
          <TabsContent value="why-spearfish" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">Understanding why this is a great opportunity</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {company.scoreBreakdown.map((item: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.factor}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        +{item.points} pts
                      </Badge>
                    </div>
                    <Progress value={(item.points / item.maxPoints) * 100} className="h-2" />
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-foreground">Total Score</span>
                    <span className="text-primary">{company.score} / 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Signals Tab */}
          <TabsContent value="technical" className="space-y-6">
            {/* GitHub Repos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Repositories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.technicalSignals.github.map((repo: any, index: number) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{repo.name}</p>
                      <p className="text-sm text-muted-foreground">{repo.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-4">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{repo.stars}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* HuggingFace Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  HuggingFace Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.technicalSignals.huggingface.map((model: any, index: number) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-4">
                      {model.downloads} downloads
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conference Talks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Conference Talks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.technicalSignals.conferences.map((conf: any, index: number) => (
                  <div key={index} className="p-4 bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{conf.event}</Badge>
                    </div>
                    <p className="font-medium text-foreground mb-1">{conf.talk}</p>
                    <p className="text-sm text-muted-foreground">{conf.speaker}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Big CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Ready to Make Your Move?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start the research process and build a project that will get you noticed by {company.name}
              </p>
              <Link to={`/research/${id}`}>
                <Button 
                  size="lg" 
                  className="text-lg h-16 px-12"
                >
                  Spearfish This Company
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
