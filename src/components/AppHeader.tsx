import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Target } from "lucide-react";

interface AppHeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  currentPage?: "discover" | "portfolio";
}

export function AppHeader({ user, currentPage }: AppHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder logout logic
    navigate("/");
  };

  return (
    <header className="border-b-2 border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-black text-foreground uppercase tracking-tight">
              SpearfishIn AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/discover"
              className={`text-sm font-semibold transition-colors uppercase tracking-wide ${
                currentPage === "discover"
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Browse Companies
            </Link>
            <Link
              to="/portfolio"
              className={`text-sm font-semibold transition-colors uppercase tracking-wide ${
                currentPage === "portfolio"
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              My Projects
            </Link>
          </nav>
        </div>

        {user ? (
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
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth">
            <Button variant="glow" size="default">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
