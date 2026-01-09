import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import SetPasswordPage from "@/pages/auth/SetPasswordPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import InventoryListPage from "@/pages/inventory/InventoryListPage";
import AddItemPage from "@/pages/inventory/AddItemPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import CategoryDetailPage from "@/pages/categories/CategoryDetailPage";
import AreasPage from "@/pages/areas/AreasPage";
import AreaDetailPage from "@/pages/areas/AreaDetailPage";
import TransactionsPage from "@/pages/transactions/TransactionsPage";
import IssueItemPage from "@/pages/transactions/IssueItemPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import UsersPage from "@/pages/users/UsersPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/set-password" element={<SetPasswordPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryListPage />} />
              <Route path="/inventory/add" element={<AddItemPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:id" element={<CategoryDetailPage />} />
              <Route path="/areas" element={<AreasPage />} />
              <Route path="/areas/:id" element={<AreaDetailPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/issue" element={<IssueItemPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
