import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Calendar, Users, Briefcase, Heart, MapPin, Code, Building2, Star, TrendingUp, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseAuthed } from "@/lib/supabaseClient";
import { useCompanyBookmark } from "@/hooks/useCompanyBookmark";

type GithubRepo = {
  id?: string;
  full_name?: string;
  name?: string;
  description?: string;
  stargazers_count?: number;
  stars?: number;
};

type GithubData = {
  repositories?: GithubRepo[];
};

type HFModel = {
  id?: string;
  modelId?: string;
  name?: string;
  description?: string;
  downloads?: number;
};

type HFData = {
  models?: HFModel[];
};

interface CompanyRow {
  id: string;
  name: string;
  one_liner: string | null;
  long_description: string | null;
  small_logo_thumb_url: string | null;
  website: string | null;
  batch: string | null;
  stage: string | null;
  team_size: number | null;
  launched_at: number | null;
  all_locations: string | null;
  tags: string[] | null;
  industries: string[] | null;
  industry: string | null;
  subindustry: string | null;
  url: string | null;
  github?: GithubData | null;
  huggingface?: HFData | null;
  app_answers?: { github?: GithubData; huggingface?: HFData } | null;
}

function formatDownloads(n?: number) {
  if (!n || isNaN(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

export default function CompanyProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  const { isBookmarked, isLoading: bookmarkLoading, toggleBookmark } = useCompanyBookmark(id || "");

  const user = useMemo(() => ({
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  }), []);

  const { data, isLoading } = useQuery({
    queryKey: ["company", id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = await getSupabaseAuthed();
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id,name,one_liner,long_description,small_logo_thumb_url,website,batch,stage,team_size,launched_at,all_locations,tags,industries,industry,subindustry,url,github,huggingface,app_answers"
        )
        .eq("id", id as string)
        .single();
      if (error) throw error;
      return data as CompanyRow;
    },
    staleTime: 60_000,
  });

  // Fetch related companies based on shared industries
  const { data: relatedCompanies } = useQuery({
    queryKey: ["related-companies", id, data?.industries],
    enabled: !!id && !!data?.industries && data.industries.length > 0,
    queryFn: async () => {
      if (!data?.industries || data.industries.length === 0) return [];
      
      const supabase = await getSupabaseAuthed();
      const { data: companies, error } = await supabase
        .from("companies")
        .select("id,name,one_liner,small_logo_thumb_url,industries")
        .overlaps("industries", data.industries)
        .neq("id", id as string)
        .limit(3);
      
      if (error) throw error;
      return companies as Pick<CompanyRow, "id" | "name" | "one_liner" | "small_logo_thumb_url" | "industries">[];
    },
    staleTime: 60_000,
  });

  const company = data;

  // Fetch user's latest research for this company (if any)
  type OpportunitySignal = { signal?: string; title?: string; description?: string };
  type PainPoint = { problem?: string; title?: string; evidence?: string; potential?: string };
  type TechnicalLandscape = { tech_stack?: string[]; github_activity?: string; [k: string]: unknown };
  type ResearchData = {
    opportunity_signals?: OpportunitySignal[];
    pain_points?: PainPoint[];
    technical_landscape?: TechnicalLandscape;
  } | null;

  const { data: research } = useQuery<ResearchData>({
    queryKey: ["company-research", id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = await getSupabaseAuthed();
      const { data, error } = await supabase
        .from("company_research")
        .select("business_intel,technical_landscape,opportunity_signals,pain_points,created_at")
        .eq("company_id", id as string)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ResearchData) || null;
    },
    staleTime: 60_000,
  });

  // Basic loading / not found states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user} currentPage="discover" />
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <p className="text-muted-foreground">Loading company...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user} currentPage="discover" />
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <p className="text-muted-foreground">Company not found.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Batch", value: company.batch || "", icon: Briefcase },
    { label: "Stage", value: company.stage || "", icon: Briefcase },
    { label: "Team Size", value: `${company.team_size ?? 0} people`, icon: Users },
    { label: "Founded", value: company.launched_at ? new Date(company.launched_at * 1000).getFullYear().toString() : "", icon: Calendar },
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
                <div className="w-24 h-24 bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground shrink-0 overflow-hidden">
                  {company.small_logo_thumb_url ? (
                    <img
                      src={company.small_logo_thumb_url}
                      alt={company.name}
                      className="w-full h-full object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    company.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-foreground">{company.name}</h1>
                    <button
                      onClick={toggleBookmark}
                      disabled={bookmarkLoading}
                      className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
                      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark company"}
                    >
                      <Heart
                        className={`h-6 w-6 transition-colors ${
                          isBookmarked
                            ? "fill-primary text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-lg text-muted-foreground mb-3">{company.one_liner}</p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      {company.website.replace("https://", "")}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
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
            <TabsTrigger value="why">Why Spearfish This?</TabsTrigger>
            <TabsTrigger value="signals">Technical Signals</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What They Do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{company.long_description || "No description available."}</p>
              </CardContent>
            </Card>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              {company.all_locations && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{company.all_locations}</p>
                  </CardContent>
                </Card>
              )}

              {/* Industry */}
              {(company.industry || company.subindustry) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Industry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {company.industry}{company.subindustry && ` • ${company.subindustry}`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tech Stack / Tags */}
            {company.tags && company.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Tech Stack & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industries */}
            {company.industries && company.industries.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.industries.map((ind, index) => (
                      <Badge key={index} variant="outline">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Y Combinator Profile Link */}
            {company.url && (
              <Card>
                <CardContent className="p-4">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-sm text-muted-foreground">View Y Combinator Profile</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Why Spearfish This? */}
          <TabsContent value="why" className="space-y-6">
            {research ? (
              <>
                {Array.isArray(research?.opportunity_signals) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Opportunity Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {research!.opportunity_signals!.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-sm font-medium">•</span>
                          <div>
                            <div className="text-sm font-semibold">{s.signal || s.title || `Signal ${i+1}`}</div>
                            {s.description && (
                              <div className="text-sm text-muted-foreground">{s.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {Array.isArray(research?.pain_points) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle key="pain">Pain Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {research!.pain_points!.map((p, i) => (
                        <div key={i} className="border border-border rounded-md p-3">
                          <div className="text-sm font-semibold">{p.problem || p.title || `Issue ${i+1}`}</div>
                          {p.evidence && (
                            <div className="text-xs text-muted-foreground mt-1">Evidence: {p.evidence}</div>
                          )}
                          {p.potential && (
                            <div className="text-xs mt-1">Opportunity: {p.potential}</div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No research found yet for this company. Run research to generate actionable signals.
                  <div className="mt-3">
                    <Link to={`/research/${id}`}>
                      <Button size="sm">Run Research</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Technical Signals */}
          <TabsContent value="signals" className="space-y-6">
            {/* GitHub Repositories from companies.github or app_answers.github */}
            {(() => {
              const c = company as CompanyRow
              const gh: GithubData | undefined = c.github ?? c.app_answers?.github
              const repos: GithubRepo[] = Array.isArray(gh?.repositories) ? gh!.repositories! : []
              if (repos.length === 0) return null
              const top = [...repos].sort((a,b) => (b.stargazers_count||b.stars||0) - (a.stargazers_count||a.stars||0)).slice(0, 5)
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      GitHub Repositories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {top.map((r, idx) => (
                      <div key={r.id || r.full_name || idx} className="flex items-center justify-between p-4 bg-secondary/40">
                        <div>
                          <div className="font-semibold text-sm">{r.full_name || r.name}</div>
                          {r.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Star className="h-4 w-4" />
                          <span>{r.stargazers_count ?? r.stars ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* HuggingFace Models from companies.huggingface or app_answers.huggingface */}
            {(() => {
              const c = company as CompanyRow
              const hf: HFData | undefined = c.huggingface ?? c.app_answers?.huggingface
              const models: HFModel[] = Array.isArray(hf?.models) ? hf!.models! : []
              if (models.length === 0) return null
              const top = [...models].sort((a,b) => (b.downloads||0)-(a.downloads||0)).slice(0, 5)
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      HuggingFace Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {top.map((m, idx) => (
                      <div key={m.id || m.modelId || idx} className="flex items-center justify-between p-4 bg-secondary/40">
                        <div>
                          <div className="font-semibold text-sm">{m.modelId || m.id || m.name}</div>
                          {m.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Download className="h-4 w-4" />
                          <span>{formatDownloads(m.downloads)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Fallback to researched technical landscape if present */}
            {research && research?.technical_landscape ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Technical Landscape (AI)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto">
{JSON.stringify(research!.technical_landscape, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>

        {/* Related Companies */}
        {relatedCompanies && relatedCompanies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Similar Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedCompanies.map((relatedCompany) => (
                <Link key={relatedCompany.id} to={`/company/${relatedCompany.id}`}>
                  <Card className="hover:border-primary transition-colors h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0 overflow-hidden">
                          {relatedCompany.small_logo_thumb_url ? (
                            <img
                              src={relatedCompany.small_logo_thumb_url}
                              alt={relatedCompany.name}
                              className="w-full h-full object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            relatedCompany.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">{relatedCompany.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedCompany.one_liner || ""}
                      </p>
                      {relatedCompany.industries && relatedCompany.industries.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {relatedCompany.industries.slice(0, 2).map((ind, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ind}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Big CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-2">Ready to Make Your Move?</h2>
              <p className="text-muted-foreground mb-6">
                Start the research process and build a project that will get you noticed by {company.name}
              </p>
              <Link to={`/research/${id}`}>
                <Button size="lg" className="text-lg h-16 px-12">Spearfish This Company</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
