import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Target,
  Upload,
  Save,
  FileText,
  Building2,
  Mail,
  Settings,
  Eye,
  Trash2,
  Calendar,
  ExternalLink,
  TrendingUp,
  FolderKanban,
  Briefcase,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data - would come from backend
  const [user, setUser] = useState({
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
    jobTitle: "Full Stack Developer",
    skills: ["React", "TypeScript", "Python", "Node.js", "TensorFlow"],
    interests: ["AI/ML", "Healthcare Tech", "Developer Tools"],
    targetRoles: ["Senior Engineer", "ML Engineer", "Tech Lead"],
    resume: "resume-2024.pdf",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    publicPortfolio: true,
  });

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newRole, setNewRole] = useState("");

  // Mock data for other tabs
  const projectStats = {
    total: 7,
    interviews: 3,
    hireRate: 14,
  };

  const researchHistory = [
    { id: 1, company: "PathAI", date: "2024-03-15", status: "Complete" },
    { id: 2, company: "Vanta", date: "2024-03-14", status: "Complete" },
    { id: 3, company: "Ramp", date: "2024-03-12", status: "Complete" },
    { id: 4, company: "Notion", date: "2024-03-10", status: "Complete" },
  ];

  const savedEmails = [
    {
      id: 1,
      company: "PathAI",
      subject: "Deep Learning Solution for Medical Image Classification",
      date: "2024-03-16",
      type: "Technical Focus",
    },
    {
      id: 2,
      company: "Vanta",
      subject: "Compliance Automation Dashboard",
      date: "2024-03-15",
      type: "Value-First",
    },
  ];

  const handleAvatarUpload = () => {
    toast({
      title: "Avatar updated!",
      description: "Your profile picture has been changed.",
    });
  };

  const handleResumeUpload = () => {
    toast({
      title: "Resume uploaded!",
      description: "Your resume has been updated.",
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile saved!",
      description: "Your changes have been updated.",
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setUser((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setUser((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setUser((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setUser((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
  };

  const addRole = () => {
    if (newRole.trim()) {
      setUser((prev) => ({ ...prev, targetRoles: [...prev.targetRoles, newRole.trim()] }));
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    setUser((prev) => ({ ...prev, targetRoles: prev.targetRoles.filter((r) => r !== role) }));
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-black text-foreground uppercase tracking-tight">
                SPEARFISH
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/discover"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Browse Companies
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Dashboard
              </Link>
              <Link
                to="/portfolio"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                My Projects
              </Link>
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tight">
            My Profile
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="research">Research History</TabsTrigger>
            <TabsTrigger value="emails">Saved Emails</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Info */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <Label className="text-foreground min-w-32">Profile Picture</Label>
                    <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Button variant="outline" onClick={handleAvatarUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Avatar
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={user.jobTitle}
                      onChange={(e) => setUser({ ...user, jobTitle: e.target.value })}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="pr-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="pr-1">
                        {interest}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeInterest(interest)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button onClick={addInterest}>Add</Button>
                  </div>
                </div>

                {/* Target Roles */}
                <div className="space-y-3">
                  <Label>Target Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.targetRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="pr-1">
                        {role}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeRole(role)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a target role..."
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addRole()}
                    />
                    <Button onClick={addRole}>Add</Button>
                  </div>
                </div>

                {/* Resume */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Resume</Label>
                  <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{user.resume}</p>
                        <p className="text-sm text-muted-foreground">Current resume</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleResumeUpload}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} size="lg" className="w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Projects */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Project Portfolio
                </CardTitle>
                <CardDescription>Overview of your completed projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Projects</p>
                          <p className="text-3xl font-black text-foreground">
                            {projectStats.total}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interviews Secured</p>
                          <p className="text-3xl font-black text-foreground">
                            {projectStats.interviews}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hire Rate</p>
                          <p className="text-3xl font-black text-foreground">
                            {projectStats.hireRate}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={() => navigate("/portfolio")} variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Portfolio
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Research History */}
          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Research History
                </CardTitle>
                <CardDescription>Companies you have researched</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {researchHistory.map((item) => (
                    <Card key={item.id} className="hover:border-primary transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-foreground">
                                {item.company}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" asChild>
                            <Link to={`/research/${item.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Research
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Saved Emails */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Saved Email Templates
                </CardTitle>
                <CardDescription>All emails generated for your outreach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedEmails.map((email) => (
                    <Card key={email.id} className="hover:border-primary transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
                              <Mail className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-foreground">{email.company}</h3>
                                <Badge variant="secondary">{email.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {email.subject}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(email.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" asChild>
                            <Link to={`/email/${email.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Email
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your preferences and account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your projects and outreach
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>
                </div>

                {/* Privacy */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold text-lg text-foreground">Privacy</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="public-portfolio">Public Portfolio</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your portfolio to be publicly viewable
                      </p>
                    </div>
                    <Switch
                      id="public-portfolio"
                      checked={settings.publicPortfolio}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, publicPortfolio: checked })
                      }
                    />
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold text-lg text-foreground">Account Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
