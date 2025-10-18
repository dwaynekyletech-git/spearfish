import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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
  Loader2,
} from "lucide-react";
import { useDashboardStats, useSavedCompanies, useRecentActivity, useDashboardRealtime } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { user: clerkUser } = useUser();
  
  // Fetch real data from Supabase
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: savedCompanies, isLoading: companiesLoading } = useSavedCompanies(4);
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(4);
  
  // Enable real-time updates for dashboard data
  useDashboardRealtime();

  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "",
    avatar: clerkUser?.imageUrl || "",
  };

  const stats = [
    { label: "Companies Researched", value: dashboardStats?.companiesResearched || 0, icon: Building2, color: "primary" },
    { label: "Projects Built", value: dashboardStats?.projectsBuilt || 0, icon: FolderKanban, color: "accent" },
    { label: "Emails Sent", value: dashboardStats?.emailsSent || 0, icon: Mail, color: "warning" },
    { label: "Interviews Secured", value: dashboardStats?.interviewsSecured || 0, icon: Briefcase, color: "primary" },
  ];

  // Map icon strings to components
  const iconMap = {
    search: Search,
    plus: Plus,
    mail: Mail,
    building: Building2,
  };

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
                    {statsLoading ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-5xl font-black text-foreground mt-2">{stat.value}</p>
                    )}
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

        {/* Saved Companies */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                Saved Companies
              </h2>
              <p className="text-muted-foreground mt-1">Your bookmarked startups</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/discover">Discover More</Link>
            </Button>
          </div>

          {companiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : savedCompanies && savedCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedCompanies.map((company) => (
                <Link key={company.id} to={`/company/${company.id}`}>
                  <Card className="hover:border-primary transition-all h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        {company.small_logo_thumb_url ? (
                          <img 
                            src={company.small_logo_thumb_url} 
                            alt={company.name} 
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {company.one_liner || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" variant="glow" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground mb-2">No saved companies yet</p>
                <p className="text-muted-foreground mb-4">Start discovering companies that match your skills</p>
                <Button asChild>
                  <Link to="/discover">
                    <Search className="w-4 h-4 mr-2" />
                    Discover Companies
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
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
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((activity) => {
                    const IconComponent = iconMap[activity.icon];
                    return (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No recent activity yet. Start exploring companies!</p>
                </div>
              )}
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
