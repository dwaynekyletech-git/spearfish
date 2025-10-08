import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { X, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOTAL_STEPS = 5;

const skillSuggestions = [
  "React", "TypeScript", "Python", "Node.js", "AWS", "Docker", 
  "Kubernetes", "PostgreSQL", "MongoDB", "GraphQL", "TensorFlow",
  "PyTorch", "Next.js", "Tailwind CSS", "Go", "Rust"
];

const interestSuggestions = [
  "Machine Learning", "AI Research", "Web Development", "Mobile Development",
  "DevOps", "Cloud Architecture", "Data Science", "Blockchain",
  "Computer Vision", "NLP", "Robotics", "Cybersecurity"
];

const roleSuggestions = [
  "Software Engineer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "ML Engineer", "Data Scientist", "DevOps Engineer",
  "Product Manager", "Engineering Manager", "Solutions Architect"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 - Basic Info
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  
  // Step 2 - Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  
  // Step 3 - Interests
  const [interests, setInterests] = useState<string[]>([]);
  
  // Step 4 - Target Roles
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  
  // Step 5 - Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  // Skills handlers
  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
      setFilteredSkills([]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value) {
      const filtered = skillSuggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase()) && !skills.includes(s)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  // Interests handlers
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Target roles handlers
  const addRole = (role: string) => {
    if (role && !targetRoles.includes(role)) {
      setTargetRoles([...targetRoles, role]);
      setRoleInput("");
      setFilteredRoles([]);
    }
  };

  const removeRole = (roleToRemove: string) => {
    setTargetRoles(targetRoles.filter(r => r !== roleToRemove));
  };

  const handleRoleInputChange = (value: string) => {
    setRoleInput(value);
    if (value) {
      const filtered = roleSuggestions.filter(r => 
        r.toLowerCase().includes(value.toLowerCase()) && !targetRoles.includes(r)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles([]);
    }
  };

  // Resume handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </h2>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          {/* Step 1 - Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Let's get to know you</h1>
                <p className="text-muted-foreground">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Current Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="3"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Skills */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your technical skills</h1>
                <p className="text-muted-foreground">Add the technologies you're proficient in</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">Add Skills</Label>
                  <div className="relative">
                    <Input
                      id="skills"
                      placeholder="Type to search or add custom skill..."
                      value={skillInput}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && skillInput) {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                      className="mt-1.5"
                    />
                    {filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredSkills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 - Interests */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">What interests you?</h1>
                <p className="text-muted-foreground">Select areas of tech that excite you</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {interestSuggestions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    className="px-4 py-2 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 - Target Roles */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Target positions</h1>
                <p className="text-muted-foreground">What roles are you looking for?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="roles">Add Target Roles</Label>
                  <div className="relative">
                    <Input
                      id="roles"
                      placeholder="Type to search or add custom role..."
                      value={roleInput}
                      onChange={(e) => handleRoleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && roleInput) {
                          e.preventDefault();
                          addRole(roleInput);
                        }
                      }}
                      className="mt-1.5"
                    />
                    {filteredRoles.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => addRole(role)}
                            className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {targetRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {targetRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="px-3 py-1.5">
                        {role}
                        <button
                          onClick={() => removeRole(role)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5 - Resume */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Upload your resume</h1>
                <p className="text-muted-foreground">Help us understand your background better</p>
              </div>

              <div>
                <Label>Resume (PDF)</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="mt-1.5 border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  {resumeFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Upload className="h-6 w-6" />
                        <span className="font-medium">{resumeFile.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">Drop your resume here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                      <p className="text-xs text-muted-foreground">PDF files only</p>
                    </div>
                  )}
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>

            <Button onClick={handleNext}>
              {currentStep === TOTAL_STEPS ? "Complete" : "Next"}
              {currentStep < TOTAL_STEPS && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}