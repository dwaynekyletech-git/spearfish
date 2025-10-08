import { useState } from "react";
import { Search, SlidersHorizontal, Building2, Users, GitBranch, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockCompanies = [
  {
    id: 1,
    name: "PathAI",
    slug: "pathai",
    one_liner: "AI-powered pathology diagnostics for cancer detection",
    long_description: "PathAI is developing AI-powered technology to improve the accuracy of diagnosis in pathology, starting with cancer.",
    small_logo_thumb_url: "",
    website: "https://pathai.com",
    all_locations: ["Boston, MA, USA"],
    batch: "W22",
    team_size: 45,
    stage: "Series B",
    isHiring: true,
    industries: ["Healthcare", "AI"],
    launched_at: "2016-01-15T00:00:00Z",
    url: "https://www.ycombinator.com/companies/pathai",
    // Custom Spearfish fields
    githubActivity: "High",
    score: 94,
  },
  {
    id: 2,
    name: "Watershed",
    slug: "watershed",
    one_liner: "Enterprise carbon accounting and climate platform",
    long_description: "Watershed helps companies measure, reduce, and report their carbon emissions with enterprise-grade software.",
    small_logo_thumb_url: "",
    website: "https://watershed.com",
    all_locations: ["San Francisco, CA, USA"],
    batch: "S19",
    team_size: 120,
    stage: "Series C",
    isHiring: true,
    industries: ["Climate", "Enterprise"],
    launched_at: "2019-06-01T00:00:00Z",
    url: "https://www.ycombinator.com/companies/watershed",
    // Custom Spearfish fields
    githubActivity: "Medium",
    score: 88,
  },
  {
    id: 3,
    name: "Mutiny",
    slug: "mutiny",
    one_liner: "No-code AI personalization for B2B websites",
    long_description: "Mutiny enables B2B companies to personalize their websites for every visitor without writing code.",
    small_logo_thumb_url: "",
    website: "https://mutinyhq.com",
    all_locations: ["San Francisco, CA, USA"],
    batch: "W18",
    team_size: 65,
    stage: "Series B",
    isHiring: false,
    industries: ["Marketing", "AI"],
    launched_at: "2018-01-01T00:00:00Z",
    url: "https://www.ycombinator.com/companies/mutiny",
    // Custom Spearfish fields
    githubActivity: "High",
    score: 92,
  },
  {
    id: 4,
    name: "Ramp",
    slug: "ramp",
    one_liner: "Finance automation and corporate cards",
    long_description: "Ramp is the finance automation platform designed to save businesses time and money.",
    small_logo_thumb_url: "",
    website: "https://ramp.com",
    all_locations: ["New York, NY, USA"],
    batch: "W19",
    team_size: 280,
    stage: "Series D",
    isHiring: true,
    industries: ["Fintech", "SaaS"],
    launched_at: "2019-02-01T00:00:00Z",
    url: "https://www.ycombinator.com/companies/ramp",
    // Custom Spearfish fields
    githubActivity: "Very High",
    score: 85,
  },
  {
    id: 5,
    name: "Loom",
    slug: "loom",
    one_liner: "Async video messaging for work",
    long_description: "Loom is a video messaging tool that helps you get your message across through instantly shareable videos.",
    small_logo_thumb_url: "",
    website: "https://loom.com",
    all_locations: ["San Francisco, CA, USA"],
    batch: "W16",
    team_size: 150,
    stage: "Series C",
    isHiring: true,
    industries: ["Productivity", "Video"],
    launched_at: "2016-01-01T00:00:00Z",
    url: "https://www.ycombinator.com/companies/loom",
    // Custom Spearfish fields
    githubActivity: "Medium",
    score: 79,
  },
  {
    id: 6,
    name: "Retool",
    slug: "retool",
    one_liner: "Build internal tools with drag-and-drop",
    long_description: "Retool is a fast way to build internal tools. Drag-and-drop our building blocks and connect them to your databases and APIs.",
    small_logo_thumb_url: "",
    website: "https://retool.com",
    all_locations: ["San Francisco, CA, USA"],
    batch: "W17",
    team_size: 200,
    stage: "Series C",
    isHiring: true,
    industries: ["Developer Tools", "SaaS"],
    launched_at: "2017-01-01T00:00:00Z",
    url: "https://www.ycombinator.com/companies/retool",
    // Custom Spearfish fields
    githubActivity: "High",
    score: 91,
  }
];

const batches = ["All", "W22", "S22", "W23", "S23", "W24"];
const industries = ["AI", "Healthcare", "Climate", "Fintech", "SaaS", "Developer Tools", "Marketing", "Productivity"];

export default function CompanyDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [hiringOnly, setHiringOnly] = useState(false);
  const [teamSize, setTeamSize] = useState([0, 500]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("score");

  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBatch("All");
    setHiringOnly(false);
    setTeamSize([0, 500]);
    setSelectedIndustries([]);
  };

  const filteredCompanies = mockCompanies
    .filter(company => {
      if (searchQuery && !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !company.one_liner.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedBatch !== "All" && company.batch !== selectedBatch) return false;
      if (hiringOnly && !company.isHiring) return false;
      if (company.team_size < teamSize[0] || company.team_size > teamSize[1]) return false;
      if (selectedIndustries.length > 0 && !company.industries.some(i => selectedIndustries.includes(i))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "teamSize") return b.team_size - a.team_size;
      if (sortBy === "batch") return b.batch.localeCompare(a.batch);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} currentPage="discover" />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Discover Companies" },
            ]}
          />
        </div>

        {/* Top Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Discover Startups</h1>
            <p className="text-muted-foreground">Find the perfect AI startup to build your project for</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Opportunity Score</SelectItem>
                <SelectItem value="teamSize">Team Size</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-80 shrink-0">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Batch */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hiring Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hiring-toggle" className="text-sm font-medium">
                      Actively Hiring
                    </Label>
                    <Switch
                      id="hiring-toggle"
                      checked={hiringOnly}
                      onCheckedChange={setHiringOnly}
                    />
                  </div>
                </div>

                {/* Team Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Team Size</Label>
                  <div className="px-2">
                    <Slider
                      value={teamSize}
                      onValueChange={setTeamSize}
                      min={0}
                      max={500}
                      step={10}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{teamSize[0]}</span>
                      <span>{teamSize[1]}+</span>
                    </div>
                  </div>
                </div>

                {/* Industries */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Industries</Label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map(industry => (
                      <Badge
                        key={industry}
                        variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleIndustry(industry)}
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCompanies.map(company => (
                <Card key={company.id} className="group hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl font-bold text-muted-foreground shrink-0">
                        {company.small_logo_thumb_url || company.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center bg-background shadow-sm">
                          <span className="text-2xl font-bold text-primary">{company.score}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Score</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground leading-tight">{company.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">{company.one_liner}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-semibold">{company.batch}</Badge>
                      {company.isHiring && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs font-semibold">
                          Hiring
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{company.team_size} people</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{company.stage}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <GitBranch className="h-4 w-4 shrink-0" />
                        <span>{company.githubActivity} Activity</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Link to={`/company/${company.id}`} className="w-full">
                      <Button className="w-full h-12 text-sm" variant="glow">
                        Spearfish This Company
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
