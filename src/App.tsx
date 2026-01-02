import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import InventoryListPage from "@/pages/inventory/InventoryListPage";
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
            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            
            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryListPage />} />
              <Route path="/categories" element={<div className="p-4">Categories - Coming Soon</div>} />
              <Route path="/areas" element={<div className="p-4">Areas - Coming Soon</div>} />
              <Route path="/transactions" element={<div className="p-4">Transactions - Coming Soon</div>} />
              <Route path="/reports" element={<div className="p-4">Reports - Coming Soon</div>} />
              <Route path="/users" element={<div className="p-4">Users - Coming Soon</div>} />
              <Route path="/settings" element={<div className="p-4">Settings - Coming Soon</div>} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
