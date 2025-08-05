
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Questionnaire from "./pages/Questionnaire";
import NotFound from "./pages/NotFound";
import WalletPage from "./pages/Wallet";
import FinancialEducation from "./pages/FinancialEducation";
import EssayAssistant from "./pages/EssayAssistant";
import TestPrep from "./pages/TestPrep";
import FirstGenResources from "./pages/FirstGenResources";
import SchoolMatchmaker from "./pages/SchoolMatchmaker";
import Footer from "./components/Footer";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const AppContent = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Don't show sidebar on auth pages
  const hideLayoutPages = ['/auth', '/questionnaire'];
  const shouldShowSidebar = user && !hideLayoutPages.includes(location.pathname);

  if (!shouldShowSidebar) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/financial-education" element={<FinancialEducation />} />
            <Route path="/essay-assistant" element={<EssayAssistant />} />
            <Route path="/test-prep" element={<TestPrep />} />
            <Route path="/first-gen-resources" element={<FirstGenResources />} />
            <Route path="/school-matchmaker" element={<SchoolMatchmaker />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 md:h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 md:px-4">
            <SidebarTrigger className="h-8 w-8 md:h-10 md:w-10" />
          </header>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/financial-education" element={<FinancialEducation />} />
              <Route path="/essay-assistant" element={<EssayAssistant />} />
              <Route path="/test-prep" element={<TestPrep />} />
              <Route path="/first-gen-resources" element={<FirstGenResources />} />
              <Route path="/school-matchmaker" element={<SchoolMatchmaker />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
