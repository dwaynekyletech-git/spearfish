import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CompanyDiscovery from "./pages/CompanyDiscovery";
import CompanyProfile from "./pages/CompanyProfile";
import Onboarding from "./pages/Onboarding";
import Research from "./pages/Research";
import ProjectIdeas from "./pages/ProjectIdeas";
import AddProject from "./pages/AddProject";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<CompanyDiscovery />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route path="/research/:id" element={<Research />} />
          <Route path="/projects/:id" element={<ProjectIdeas />} />
          <Route path="/add-project" element={<AddProject />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
