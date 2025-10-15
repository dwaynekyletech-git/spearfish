import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { useUserSync } from "@/lib/auth/userSync";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import EmailGeneration from "./pages/EmailGeneration";
import CompanyDiscovery from "./pages/CompanyDiscovery";
import CompanyProfile from "./pages/CompanyProfile";
import Onboarding from "./pages/Onboarding";
import Research from "./pages/Research";
import ProjectIdeas from "./pages/ProjectIdeas";
import AddProject from "./pages/AddProject";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component with User Sync
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Sync user data between Clerk and Supabase
  useUserSync();
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/email/:companyId" element={<ProtectedRoute><EmailGeneration /></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><CompanyDiscovery /></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/research/:id" element={<ProtectedRoute><Research /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectIdeas /></ProtectedRoute>} />
            <Route path="/add-project" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
