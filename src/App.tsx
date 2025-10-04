import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { SessionContextProvider } from "@/contexts/SessionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import React, { Suspense } from "react"; // Import React and Suspense
import { Loading } from "@/components/Loading"; // Import Loading component for fallback

// Lazy load page components
const ComponentsShowcase = React.lazy(() => import("./pages/ComponentsShowcase"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const TransactionsPage = React.lazy(() => import("./pages/TransactionsPage"));
const AccountsPage = React.lazy(() => import("./pages/AccountsPage"));
const ReportsPage = React.lazy(() => import("./pages/ReportsPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const RecurringTransactionsPage = React.lazy(() => import("./pages/RecurringTransactionsPage"));
const CategoriesPage = React.lazy(() => import("./pages/CategoriesPage"));
const BudgetsPage = React.lazy(() => import("./pages/BudgetsPage"));

const queryClient = new QueryClient();

const AppContent = () => {
  useOfflineSync(); // Activate the offline sync hook

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loading count={5} className="w-64" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<PageLayout><DashboardPage /></PageLayout>} />
          <Route path="/transactions" element={<PageLayout><TransactionsPage /></PageLayout>} />
          <Route path="/recurring-transactions" element={<PageLayout><RecurringTransactionsPage /></PageLayout>} />
          <Route path="/accounts" element={<PageLayout><AccountsPage /></PageLayout>} />
          <Route path="/categories" element={<PageLayout><CategoriesPage /></PageLayout>} />
          <Route path="/budgets" element={<PageLayout><BudgetsPage /></PageLayout>} />
          <Route path="/reports" element={<PageLayout><ReportsPage /></PageLayout>} />
          <Route path="/settings" element={<PageLayout><SettingsPage /></PageLayout>} />
          <Route path="/profile" element={<PageLayout><ProfilePage /></PageLayout>} />
          <Route path="/components-showcase" element={<PageLayout><ComponentsShowcase /></PageLayout>} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <AppContent />
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;