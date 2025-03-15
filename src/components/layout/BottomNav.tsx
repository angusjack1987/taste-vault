
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  CalendarDays, 
  Settings,
  User,
  ShoppingBasket,
  Refrigerator,
  UtensilsCrossed,
  Baby
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showBabyFeature, setShowBabyFeature] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user preferences:', error);
          return;
        }
        
        if (data?.preferences) {
          const preferences = data.preferences;
          const enableBabyFeature = typeof preferences === 'object' && 
            preferences && 
            'features' in preferences && 
            typeof preferences.features === 'object' && 
            preferences.features && 
            'enableBabyFeature' in preferences.features ? 
            Boolean(preferences.features.enableBabyFeature) : false;
            
          setShowBabyFeature(enableBabyFeature);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchUserPreferences();
  }, [user]);
  
  const mainNavItems: NavItem[] = [
    { path: "/", icon: <Home className="h-6 w-6" />, label: "Home" },
    { path: "/recipes", icon: <UtensilsCrossed className="h-6 w-6" />, label: "Recipes" },
    { path: "/meal-plan", icon: <CalendarDays className="h-6 w-6" />, label: "Meal Plan" },
    { path: "/fridge", icon: <Refrigerator className="h-6 w-6" />, label: "Fridge" },
    { path: "/shopping", icon: <ShoppingBasket className="h-6 w-6" />, label: "Shopping" },
  ];
  
  if (showBabyFeature) {
    mainNavItems.push({ 
      path: "/baby-food", 
      icon: <Baby className="h-6 w-6" />, 
      label: "Baby Food" 
    });
  }
  
  mainNavItems.push({ 
    path: "/settings", 
    icon: <Settings className="h-6 w-6" />, 
    label: "Settings" 
  });
  
  const maxVisibleItems = isMobile ? 5 : mainNavItems.length;
  const visibleNavItems = mainNavItems.slice(0, maxVisibleItems);
  const overflowNavItems = mainNavItems.slice(maxVisibleItems);

  return (
    <div className="w-full md:max-w-3xl">
      <ul className="flex justify-between px-4 md:px-0">
        {visibleNavItems.map((item) => (
          <li key={item.path} className="text-center">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "nav-item flex flex-col items-center p-1",
                  isActive
                    ? "nav-item-active text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
              end={item.path === "/"}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper function for class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default BottomNav;
