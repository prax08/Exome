import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ComponentsShowcase from "./pages/ComponentsShowcase";
import NotFound from "./pages/NotFound";
import { PageLayout } from "@/components/PageLayout";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import RecurringTransactionsPage from "./pages/RecurringTransactionsPage"; // Import new page
import { SessionContextProvider } from "@/contexts/SessionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<PageLayout><DashboardPage /></PageLayout>} />
              <Route path="/transactions" element={<PageLayout><TransactionsPage /></PageLayout>} />
              <Route path="/recurring-transactions" element={<PageLayout><RecurringTransactionsPage /></PageLayout>} /> {/* New Route */}
              <Route path="/accounts" element={<PageLayout><AccountsPage /></PageLayout>} />
              <Route path="/reports" element={<PageLayout><ReportsPage /></PageLayout>} />
              <Route path="/settings" element={<PageLayout><SettingsPage /></PageLayout>} />
              <Route path="/profile" element={<PageLayout><ProfilePage /></PageLayout>} />
              <Route path="/components-showcase" element={<PageLayout><ComponentsShowcase /></PageLayout>} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;