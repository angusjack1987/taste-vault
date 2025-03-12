
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";

// Import pages
import Dashboard from "./pages/dashboard/Index";
import RecipesList from "./pages/recipes/RecipesList";
import RecipeDetail from "./pages/recipes/RecipeDetail";
import RecipeForm from "./pages/recipes/RecipeForm";
import MealPlan from "./pages/meal-plan/Index";
import Settings from "./pages/settings/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - don't require authentication */}
            <Route path="/auth/login" element={
              <AuthGuard requireAuth={false}>
                <Login />
              </AuthGuard>
            } />
            <Route path="/auth/register" element={
              <AuthGuard requireAuth={false}>
                <Register />
              </AuthGuard>
            } />
            
            {/* Protected routes - require authentication */}
            <Route path="/" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/recipes" element={
              <AuthGuard>
                <RecipesList />
              </AuthGuard>
            } />
            <Route path="/recipes/new" element={
              <AuthGuard>
                <RecipeForm />
              </AuthGuard>
            } />
            <Route path="/recipes/:id" element={
              <AuthGuard>
                <RecipeDetail />
              </AuthGuard>
            } />
            <Route path="/recipes/:id/edit" element={
              <AuthGuard>
                <RecipeForm />
              </AuthGuard>
            } />
            <Route path="/meal-plan" element={
              <AuthGuard>
                <MealPlan />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
