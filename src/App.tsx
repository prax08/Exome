import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PageLayout } from "@/components/PageLayout";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage"; // Import the new login page
import { SessionContextProvider } from "@/contexts/SessionContext"; // Import the session context provider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap the routes with SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<LoginPage />} /> {/* Add the login route */}
            <Route path="/" element={<PageLayout><Index /></PageLayout>} />
            <Route path="/transactions" element={<PageLayout><TransactionsPage /></PageLayout>} />
            <Route path="/accounts" element={<PageLayout><AccountsPage /></PageLayout>} />
            <Route path="/reports" element={<PageLayout><ReportsPage /></PageLayout>} />
            <Route path="/settings" element={<PageLayout><SettingsPage /></PageLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;