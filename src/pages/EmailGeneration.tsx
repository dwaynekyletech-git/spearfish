import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Target,
  Copy,
  Edit,
  Check,
  Sparkles,
  Mail,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVariation {
  id: string;
  type: "technical" | "value-first" | "personal";
  title: string;
  description: string;
  subject: string;
  body: string;
}

const EmailGeneration = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState<string>("technical");
  const [markAsSent, setMarkAsSent] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailVariation | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  // Mock data - would come from backend/AI in real app
  const user = {
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "",
  };

  const company = {
    name: "PathAI",
    id: companyId || "1",
  };

  const project = {
    title: "Medical Image Classifier",
    impact: "reduced diagnosis time by 40%",
    technologies: ["Python", "TensorFlow", "React"],
    demoLink: "https://demo.example.com",
  };

  const emailVariations: EmailVariation[] = [
    {
      id: "technical",
      type: "technical",
      title: "Technical Focus",
      description: "Emphasizes your technical solution and implementation",
      subject: `Deep Learning Solution for Medical Image Classification`,
      body: `Hi [Hiring Manager],

I've been following PathAI's work in AI-powered diagnostics and noticed the challenges around image analysis processing time. I built a deep learning classifier to explore potential solutions.

Technical Approach:
• Implemented a TensorFlow-based CNN architecture
• Achieved 94% accuracy on medical image classification
• Reduced processing time by 40% compared to manual analysis
• Built a React dashboard for real-time visualization

The solution processes images in real-time and provides diagnostic suggestions with confidence scores. I'd be happy to discuss the technical implementation and how similar approaches could fit into PathAI's pipeline.

Demo: ${project.demoLink}

Would you have 15 minutes to discuss this?

Best regards,
${user.name}`,
    },
    {
      id: "value-first",
      type: "value-first",
      title: "Value-First",
      description: "Emphasizes business impact and outcomes",
      subject: `40% Faster Medical Diagnostics: A Case Study`,
      body: `Hi [Hiring Manager],

PathAI is transforming how we approach medical diagnostics, and I wanted to share something that might interest you.

I built a medical image classifier that achieved:
✓ 40% reduction in diagnosis time
✓ 94% accuracy rate
✓ Real-time processing capabilities

The Business Impact:
This type of efficiency could help PathAI process more cases daily, improve patient outcomes through faster diagnosis, and reduce operational costs.

I documented the entire process and results. The system is live and processing real medical images with strong accuracy metrics.

I'd love to discuss how this aligns with PathAI's mission and where you're heading next.

Demo: ${project.demoLink}

Are you free for a quick call this week?

Best,
${user.name}`,
    },
    {
      id: "personal",
      type: "personal",
      title: "Personal Connection",
      description: "More personable tone, shows genuine interest",
      subject: `Inspired by PathAI's Mission in Medical AI`,
      body: `Hi [Hiring Manager],

I've been genuinely excited about what PathAI is doing in medical diagnostics. As someone passionate about applying AI to healthcare challenges, your work really resonates with me.

I recently built a medical image classifier as a personal project to better understand the challenges in this space. It was fascinating to work through problems like accuracy optimization and processing speed—I managed to achieve 94% accuracy and cut processing time by 40%.

What I Found Most Interesting:
• The balance between speed and accuracy in medical contexts
• How real-time feedback changes the diagnostic workflow
• The importance of interpretable AI in healthcare decisions

I'm not just looking for any opportunity—I specifically want to work on problems like the ones PathAI is solving. I'd love to learn more about your current challenges and share what I've learned building this classifier.

Demo: ${project.demoLink}

Would you be open to a conversation?

Looking forward to hearing from you,
${user.name}`,
    },
  ];

  const handleCopyEmail = (email: EmailVariation) => {
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(fullEmail);
    toast({
      title: "Email copied!",
      description: "Ready to paste into your email client.",
    });
  };

  const handleCopySelected = () => {
    const selected = emailVariations.find((e) => e.id === selectedEmail);
    if (selected) {
      handleCopyEmail(selected);
      
      if (markAsSent) {
        toast({
          title: "Email copied and marked as sent!",
          description: "Your project status has been updated.",
        });
        // Would update project status in backend
      }
    }
  };

  const handleEdit = (email: EmailVariation) => {
    setEditingEmail(email);
    setEditedSubject(email.subject);
    setEditedBody(email.body);
  };

  const handleSaveEdit = () => {
    if (editingEmail) {
      toast({
        title: "Email updated!",
        description: "Your changes have been saved.",
      });
      // Would save to backend
      setEditingEmail(null);
    }
  };

  const handleSaveTemplate = () => {
    const selected = emailVariations.find((e) => e.id === selectedEmail);
    toast({
      title: "Template saved!",
      description: `"${selected?.title}" saved for future use.`,
    });
  };

  const getEmailIcon = (type: EmailVariation["type"]) => {
    return <Sparkles className="w-5 h-5" />;
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
                Spearfish AI
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
              <DropdownMenuItem>Profile</DropdownMenuItem>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/portfolio" className="hover:text-primary">
              My Projects
            </Link>
            <span>/</span>
            <span>{project.title}</span>
          </div>
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tight">
            Outreach Email for <span className="text-primary">{company.name}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Showcase your project to get noticed
          </p>
        </div>

        {/* Project Context */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your project that {project.impact}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Variations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Choose Your Approach
          </h2>
          <RadioGroup value={selectedEmail} onValueChange={setSelectedEmail}>
            <div className="grid gap-6">
              {emailVariations.map((email) => (
                <Card
                  key={email.id}
                  className={`cursor-pointer transition-all ${
                    selectedEmail === email.id
                      ? "border-2 border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedEmail(email.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <RadioGroupItem value={email.id} id={email.id} className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getEmailIcon(email.type)}
                            <Label
                              htmlFor={email.id}
                              className="text-xl font-black cursor-pointer"
                            >
                              {email.title}
                            </Label>
                          </div>
                          <CardDescription>{email.description}</CardDescription>
                          <div className="pt-2">
                            <p className="text-sm font-semibold text-foreground mb-1">
                              Subject:
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                              {email.subject}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(email);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyEmail(email);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded border border-border">
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {email.body}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Bottom Actions */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mark-sent"
                    checked={markAsSent}
                    onCheckedChange={(checked) => setMarkAsSent(checked as boolean)}
                  />
                  <Label
                    htmlFor="mark-sent"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Mark as Sent
                  </Label>
                </div>
                <Button variant="outline" onClick={handleSaveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>
              <Button size="lg" onClick={handleCopySelected} className="min-w-48">
                <Copy className="w-4 h-4 mr-2" />
                Copy Selected Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminder */}
        <Card className="bg-accent/10 border-accent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Important: Send from your own email
                </p>
                <p className="text-sm text-muted-foreground">
                  Emails sent from your personal email address have higher authenticity and
                  deliverability. Copy the email and send it through your own email client.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editingEmail !== null} onOpenChange={() => setEditingEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Edit Email - {editingEmail?.title}
            </DialogTitle>
            <DialogDescription>
              Customize the email to match your personal style
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Enter subject line..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                placeholder="Enter email body..."
                rows={15}
                className="font-sans"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingEmail(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailGeneration;
