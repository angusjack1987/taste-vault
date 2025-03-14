
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ChefHat, ShoppingBag, CalendarRange, User, RefrigeratorIcon, Baby } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface BottomNavProps {
  className?: string;
}

const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("preferences")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user preferences:", error);
        } else if (data?.preferences) {
          // Check if preferences is an object (not a string or array)
          if (typeof data.preferences === 'object' && !Array.isArray(data.preferences)) {
            setUserPreferences(data.preferences);
          }
        }
      } catch (err) {
        console.error("Error in fetchUserPreferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  // Check if baby food is enabled in user preferences
  const isBabyFoodEnabled = userPreferences?.food?.babyFoodEnabled || false;

  // Get active route
  const getActiveClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return isActive
      ? "text-primary border-t-4 pt-1 border-primary hover:text-primary"
      : "text-muted-foreground border-t-4 pt-1 border-transparent hover:text-primary";
  };

  // Array of routes for the bottom nav
  const routes = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/recipes", label: "Recipes", icon: <ChefHat className="h-5 w-5" /> },
    { path: "/fridge", label: "Fridge", icon: <RefrigeratorIcon className="h-5 w-5" /> },
    { path: "/meal-plan", label: "Meal Plan", icon: <CalendarRange className="h-5 w-5" /> },
    { path: "/shopping", label: "Shopping", icon: <ShoppingBag className="h-5 w-5" /> },
  ];
  
  // Only add Baby Food tab if enabled in preferences
  if (isBabyFoodEnabled) {
    routes.splice(3, 0, { 
      path: "/baby-food", 
      label: "Baby Food", 
      icon: <Baby className="h-5 w-5" /> 
    });
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-2 shadow-lg z-30 sm:hidden ${className}`}
    >
      <div className="flex justify-between items-center h-full">
        <TooltipProvider>
          {routes.map((route) => (
            <Tooltip key={route.path} delayDuration={300}>
              <TooltipTrigger asChild>
                <Link
                  to={route.path}
                  aria-label={route.label}
                  className={`flex flex-1 flex-col items-center justify-center text-xs ${getActiveClass(route.path)}`}
                >
                  {route.icon}
                  <span className="mt-1">{route.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>{route.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Link
                to="/settings"
                aria-label="Settings"
                className={`flex flex-1 flex-col items-center justify-center text-xs ${getActiveClass("/settings")}`}
              >
                <User className="h-5 w-5" />
                <span className="mt-1">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
};

export default BottomNav;
