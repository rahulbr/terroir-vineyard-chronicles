
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Blocks from "./pages/Blocks";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Vineyard from "./pages/Vineyard";
import Settings from "./pages/Settings";
import GrowthCurve from "./pages/GrowthCurve";
import NotFound from "./pages/NotFound";
import { BertinProvider } from "./components/bertin/BertinProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BertinProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/growth-curve" element={<GrowthCurve />} />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/vineyard" element={<Vineyard />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BertinProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
