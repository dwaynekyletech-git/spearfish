import { useState } from "react";
import { Search, SlidersHorizontal, Building2, Users, GitBranch, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
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
    description: "AI-powered pathology diagnostics for cancer detection",
    logo: "",
    batch: "W22",
    teamSize: 45,
    stage: "Series B",
    githubActivity: "High",
    score: 94,
    hiring: true,
    industries: ["Healthcare", "AI"]
  },
  {
    id: 2,
    name: "Watershed",
    description: "Enterprise carbon accounting and climate platform",
    logo: "",
    batch: "S19",
    teamSize: 120,
    stage: "Series C",
    githubActivity: "Medium",
    score: 88,
    hiring: true,
    industries: ["Climate", "Enterprise"]
  },
  {
    id: 3,
    name: "Mutiny",
    description: "No-code AI personalization for B2B websites",
    logo: "",
    batch: "W18",
    teamSize: 65,
    stage: "Series B",
    githubActivity: "High",
    score: 92,
    hiring: false,
    industries: ["Marketing", "AI"]
  },
  {
    id: 4,
    name: "Ramp",
    description: "Finance automation and corporate cards",
    logo: "",
    batch: "W19",
    teamSize: 280,
    stage: "Series D",
    githubActivity: "Very High",
    score: 85,
    hiring: true,
    industries: ["Fintech", "SaaS"]
  },
  {
    id: 5,
    name: "Loom",
    description: "Async video messaging for work",
    logo: "",
    batch: "W16",
    teamSize: 150,
    stage: "Series C",
    githubActivity: "Medium",
    score: 79,
    hiring: true,
    industries: ["Productivity", "Video"]
  },
  {
    id: 6,
    name: "Retool",
    description: "Build internal tools with drag-and-drop",
    logo: "",
    batch: "W17",
    teamSize: 200,
    stage: "Series C",
    githubActivity: "High",
    score: 91,
    hiring: true,
    industries: ["Developer Tools", "SaaS"]
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
          !company.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedBatch !== "All" && company.batch !== selectedBatch) return false;
      if (hiringOnly && !company.hiring) return false;
      if (company.teamSize < teamSize[0] || company.teamSize > teamSize[1]) return false;
      if (selectedIndustries.length > 0 && !company.industries.some(i => selectedIndustries.includes(i))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "teamSize") return b.teamSize - a.teamSize;
      if (sortBy === "batch") return b.batch.localeCompare(a.batch);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl">🎯</div>
              <span className="text-xl font-bold text-foreground">Spearfish</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/discover" className="text-sm font-medium text-primary">
                Browse Companies
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Projects
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map(company => (
                <Card key={company.id} className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-16 h-16 bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {company.logo || company.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-14 w-14 rounded-full border-4 border-primary flex items-center justify-center bg-background">
                          <span className="text-xl font-bold text-primary">{company.score}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Score</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{company.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary">{company.batch}</Badge>
                      {company.hiring && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Hiring
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{company.teamSize} people</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{company.stage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GitBranch className="h-4 w-4" />
                        <span>{company.githubActivity} Activity</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/company/${company.id}`} className="w-full">
                      <Button className="w-full" variant="glow">
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
