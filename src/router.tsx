
import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import DashboardIndex from "./pages/dashboard/Index";
import RecipesList from "./pages/recipes/RecipesList";
import RecipeDetail from "./pages/recipes/RecipeDetail";
import RecipeForm from "./pages/recipes/RecipeForm";
import MealPlanIndex from "./pages/meal-plan/Index";
import FridgeIndex from "./pages/fridge/Index";
import ShoppingIndex from "./pages/shopping/Index";
import SousChefIndex from "./pages/sous-chef/index";
import SettingsIndex from "./pages/settings/Index";
import ProfileSettings from "./pages/settings/Profile";
import FoodPreferences from "./pages/settings/FoodPreferences";
import AISettings from "./pages/settings/AISettings";
import SyncSettings from "./pages/settings/SyncSettings";
import DesignSystem from "./pages/settings/DesignSystem";
import BabyFoodIndex from "./pages/baby-food/Index";
import BabyFoodPage from "./pages/baby-food/BabyFoodPage";
import AuthGuard from "./components/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/index" replace />,
    errorElement: <NotFound />,
  },
  {
    path: "/index",
    element: (
      <AuthGuard>
        <Index />
      </AuthGuard>
    ),
  },
  {
    path: "/auth/login",
    element: (
      <AuthGuard requireAuth={false}>
        <Login />
      </AuthGuard>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <AuthGuard requireAuth={false}>
        <Register />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <DashboardIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/recipes",
    element: (
      <AuthGuard>
        <RecipesList />
      </AuthGuard>
    ),
  },
  {
    path: "/recipes/new",
    element: (
      <AuthGuard>
        <RecipeForm />
      </AuthGuard>
    ),
  },
  {
    path: "/recipes/:id",
    element: (
      <AuthGuard>
        <RecipeDetail />
      </AuthGuard>
    ),
  },
  {
    path: "/recipes/:id/edit",
    element: (
      <AuthGuard>
        <RecipeForm />
      </AuthGuard>
    ),
  },
  {
    path: "/meal-plan",
    element: (
      <AuthGuard>
        <MealPlanIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/fridge",
    element: (
      <AuthGuard>
        <FridgeIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/shopping",
    element: (
      <AuthGuard>
        <ShoppingIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/sous-chef",
    element: (
      <AuthGuard>
        <SousChefIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/settings",
    element: (
      <AuthGuard>
        <SettingsIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/settings/profile",
    element: (
      <AuthGuard>
        <ProfileSettings />
      </AuthGuard>
    ),
  },
  {
    path: "/settings/food-preferences",
    element: (
      <AuthGuard>
        <FoodPreferences />
      </AuthGuard>
    ),
  },
  {
    path: "/settings/ai",
    element: (
      <AuthGuard>
        <AISettings />
      </AuthGuard>
    ),
  },
  {
    path: "/settings/sync",
    element: (
      <AuthGuard>
        <SyncSettings />
      </AuthGuard>
    ),
  },
  {
    path: "/settings/design",
    element: (
      <AuthGuard>
        <DesignSystem />
      </AuthGuard>
    ),
  },
  {
    path: "/baby-food",
    element: (
      <AuthGuard>
        <BabyFoodIndex />
      </AuthGuard>
    ),
  },
  {
    path: "/baby-food/:age",
    element: (
      <AuthGuard>
        <BabyFoodPage />
      </AuthGuard>
    ),
  },
]);
