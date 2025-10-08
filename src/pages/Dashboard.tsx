import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  FolderKanban,
  Mail,
  Briefcase,
  Search,
  Plus,
  Eye,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  // Mock data - would come from backend in real app
  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const stats = [
    { label: "Companies Researched", value: 24, icon: Building2, color: "primary" },
    { label: "Projects Built", value: 7, icon: FolderKanban, color: "accent" },
    { label: "Emails Sent", value: 15, icon: Mail, color: "warning" },
    { label: "Interviews Secured", value: 3, icon: Briefcase, color: "primary" },
  ];

  const recommendedStartups = [
    {
      id: 1,
      logo: "",
      name: "PathAI",
      tagline: "AI-powered medical diagnostics",
      score: 94,
      matchReason: "Strong ML focus",
    },
    {
      id: 2,
      logo: "",
      name: "Vanta",
      tagline: "Security compliance automation",
      score: 89,
      matchReason: "DevOps expertise needed",
    },
    {
      id: 3,
      logo: "",
      name: "Ramp",
      tagline: "Corporate card and expense management",
      score: 87,
      matchReason: "Backend scale challenges",
    },
    {
      id: 4,
      logo: "",
      name: "Notion",
      tagline: "Connected workspace for teams",
      score: 85,
      matchReason: "React expertise valued",
    },
  ];

  const recentActivity = [
    { action: "Researched PathAI", time: "2 hours ago", icon: Search },
    { action: "Added project: Medical Image Classifier", time: "5 hours ago", icon: Plus },
    { action: "Sent outreach to Vanta CTO", time: "1 day ago", icon: Mail },
    { action: "Completed Ramp technical research", time: "2 days ago", icon: Building2 },
  ];

  const quickActions = [
    {
      title: "Discover New Startups",
      description: "Find companies that match your skills",
      icon: Search,
      color: "primary",
    },
    {
      title: "Add a Project",
      description: "Showcase your latest work",
      icon: Plus,
      color: "accent",
    },
    {
      title: "View Portfolio",
      description: "See all your spearfishing targets",
      icon: Eye,
      color: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />

      <main className="container mx-auto px-4 py-12 max-w-7xl space-y-12">
        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground">
            Welcome back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-xl text-muted-foreground">Ready to land your next opportunity?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:border-primary transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-5xl font-black text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary"
                        : stat.color === "accent"
                        ? "bg-accent"
                        : "bg-warning"
                    }`}
                  >
                    <stat.icon
                      className={`w-8 h-8 ${
                        stat.color === "primary"
                          ? "text-primary-foreground"
                          : stat.color === "accent"
                          ? "text-accent-foreground"
                          : "text-warning-foreground"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommended Startups */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                Recommended Startups
              </h2>
              <p className="text-muted-foreground mt-1">Perfect matches based on your profile</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/discover">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedStartups.map((startup) => (
              <Link key={startup.id} to={`/company/${startup.id}`}>
                <Card className="hover:border-primary transition-all h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xl font-black text-primary">{startup.score}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{startup.name}</CardTitle>
                    <CardDescription className="text-sm">{startup.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-2">
                      {startup.matchReason}
                    </div>
                    <Button className="w-full" variant="glow" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Spearfish
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                      <activity.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                Quick Actions
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Jump right in</p>
            </div>

            <div className="space-y-4">
              <Link to="/discover">
                <Card className="cursor-pointer hover:border-primary hover:translate-x-1 hover:translate-y-[-4px] transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-primary">
                        <Search className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Discover New Startups</h3>
                        <p className="text-sm text-muted-foreground">Find companies that match your skills</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/add-project">
                <Card className="cursor-pointer hover:border-primary hover:translate-x-1 hover:translate-y-[-4px] transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-accent">
                        <Plus className="w-7 h-7 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">Add a Project</h3>
                        <p className="text-sm text-muted-foreground">Showcase your latest work</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/portfolio">
                <Card className="cursor-pointer hover:border-primary hover:translate-x-1 hover:translate-y-[-4px] transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-warning">
                        <Eye className="w-7 h-7 text-warning-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">View Portfolio</h3>
                        <p className="text-sm text-muted-foreground">See all your spearfishing targets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
