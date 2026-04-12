
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Lewte from "./pages/Lewte";
import Scholarships from "./pages/Scholarships";
import Admin from "./pages/Admin";
import QRRedeem from "./pages/QRRedeem";
import Footer from "./components/Footer";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { supabase } from "./integrations/supabase/client";
import { SvgGradientDefs } from "./components/ui/gradient-icon";

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
  
  const hideNavPages = ['/auth', '/questionnaire'];
  const showNavbar = user && !hideNavPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <DashboardNavbar />}
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
          <Route path="/lewte" element={<Lewte />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/qr/:code" element={<QRRedeem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SvgGradientDefs />
        <AppContent />
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
