
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
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
          <Toaster />
          <Sonner />
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
