import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";
import SousChefPage from "@/pages/sous-chef";

// Import pages
import Dashboard from "./pages/dashboard/Index";
import RecipesList from "./pages/recipes/RecipesList";
import RecipeDetail from "./pages/recipes/RecipeDetail";
import RecipeForm from "./pages/recipes/RecipeForm";
import MealPlan from "./pages/meal-plan/Index";
import ShoppingListPage from "./pages/shopping/Index";
import FridgePage from "./pages/fridge/Index";
import Settings from "./pages/settings/Index";
import Profile from "./pages/settings/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FoodPreferences from "./pages/settings/FoodPreferences";
import AISettings from "@/pages/settings/AISettings";
import BabyFoodPage from "./pages/baby-food/BabyFoodPage";
import DesignSystem from "./pages/settings/DesignSystem";
import Onboarding from "./pages/onboarding/Index";

const queryClient = new QueryClient();

function App() {
  return (
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
              
              {/* Onboarding route - requires authentication */}
              <Route path="/onboarding" element={
                <AuthGuard>
                  <Onboarding />
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
              <Route path="/shopping" element={
                <AuthGuard>
                  <ShoppingListPage />
                </AuthGuard>
              } />
              <Route path="/fridge" element={
                <AuthGuard>
                  <FridgePage />
                </AuthGuard>
              } />
              <Route path="/baby-food" element={
                <AuthGuard>
                  <BabyFoodPage />
                </AuthGuard>
              } />
              {/* Settings Routes */}
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/settings/food-preferences" element={
                <AuthGuard>
                  <FoodPreferences />
                </AuthGuard>
              } />
              <Route path="/settings/ai-settings" element={
                <AuthGuard>
                  <AISettings />
                </AuthGuard>
              } />
              <Route path="/settings/design-system" element={
                <AuthGuard>
                  <DesignSystem />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } />
              {/* Add the new route for Sous Chef */}
              <Route path="/sous-chef" element={
                <AuthGuard>
                  <MainLayout title="Sous Chef" hideNavigation={false}>
                    <SousChefPage />
                  </MainLayout>
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
