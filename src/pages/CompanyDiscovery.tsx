import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Building2, Users, Briefcase, Heart } from "lucide-react";
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
import { getSupabaseAuthed } from "@/lib/supabaseClient";
import { useCompanyBookmark } from "@/hooks/useCompanyBookmark";

const industries = [
  "AI",
  "Healthcare",
  "Climate",
  "Fintech",
  "SaaS",
  "Developer Tools",
  "Marketing",
  "Productivity",
];

interface Company {
  id: string;
  yc_id: number | null;
  name: string;
  one_liner: string | null;
  small_logo_thumb_url: string | null;
  website: string | null;
  batch: string | null;
  team_size: number | null;
  stage: string | null;
  is_hiring: boolean | null;
  industries: string[] | null;
}

function BookmarkButton({ companyId }: { companyId: string }) {
  const { isBookmarked, isLoading, toggleBookmark } = useCompanyBookmark(companyId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors disabled:opacity-50"
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark company"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isBookmarked
            ? "fill-primary text-primary"
            : "text-muted-foreground hover:text-primary"
        }`}
      />
    </button>
  );
}

export default function CompanyDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hiringOnly, setHiringOnly] = useState(false);
  const [teamSize, setTeamSize] = useState<[number, number]>([0, 500]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("teamSize");
  const [page, setPage] = useState(0);
  const pageSize = 24;

  const user = useMemo(() => ({
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  }), []);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setHiringOnly(false);
    setTeamSize([0, 500]);
    setSelectedIndustries([]);
    setPage(0);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "companies",
      { searchQuery, hiringOnly, teamSize, selectedIndustries, sortBy, page, pageSize },
    ],
    queryFn: async () => {
      const supabase = await getSupabaseAuthed();
      let query = supabase
        .from("companies")
        .select(
          "id,yc_id,name,one_liner,small_logo_thumb_url,website,batch,team_size,stage,is_hiring,industries",
          { count: "exact" }
        );

      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(
          `name.ilike.%${q}%,one_liner.ilike.%${q}%`
        );
      }

      if (hiringOnly) query = query.eq("is_hiring", true);
      if (teamSize[0] > 0) query = query.gte("team_size", teamSize[0]);
      if (teamSize[1] < 500) query = query.lte("team_size", teamSize[1]);
      if (selectedIndustries.length > 0)
        query = query.overlaps("industries", selectedIndustries);

      if (sortBy === "teamSize") query = query.order("team_size", { ascending: false });
      else if (sortBy === "batch") query = query.order("batch", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data as Company[]) || [], count: count || 0 };
    },
    staleTime: 60_000,
  });

  const companies = data?.rows ?? [];
  const total = data?.count ?? 0;

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
                <SelectItem value="teamSize">Team Size</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="score">Opportunity Score (N/A)</SelectItem>
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
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                      }}
                      className="pl-9"
                    />
                  </div>
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
                      onCheckedChange={(v) => {
                        setHiringOnly(!!v);
                        setPage(0);
                      }}
                    />
                  </div>
                </div>

                {/* Team Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Team Size</Label>
                  <div className="px-2">
                    <Slider
                      value={teamSize}
                      onValueChange={(v) => {
                        setTeamSize(v as [number, number]);
                        setPage(0);
                      }}
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
                    {industries.map((industry) => (
                      <Badge
                        key={industry}
                        variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          toggleIndustry(industry);
                          setPage(0);
                        }}
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
              {isLoading ? "Loading companies..." : `Showing ${companies.length} of ${total} ${total === 1 ? "company" : "companies"}`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {companies.map((company) => (
                <Card key={company.id} className="group hover:shadow-xl transition-shadow relative">
                  <BookmarkButton companyId={company.id} />
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl font-bold text-muted-foreground shrink-0 overflow-hidden">
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
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground leading-tight">{company.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">{company.one_liner}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {company.batch && (
                        <Badge variant="secondary" className="text-xs font-semibold">{company.batch}</Badge>
                      )}
                      {company.is_hiring && (
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
                        <span>{company.team_size ?? 0} people</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{company.stage || ""}</span>
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

            {!isLoading && companies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">Page {page + 1}</div>
              <Button
                variant="outline"
                disabled={(page + 1) * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
