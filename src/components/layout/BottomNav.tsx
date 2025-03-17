
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Plus, Calendar, Settings, Refrigerator, ChefHat, Baby, BookPlus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [babyFoodEnabled, setBabyFoodEnabled] = useState(false);
  const { user } = useAuth();

  // Check if baby food feature is enabled in user preferences
  useEffect(() => {
    const checkBabyFoodEnabled = async () => {
      if (!user) {
        setBabyFoodEnabled(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
        
        // Handle the case where preferences is a string or an object
        if (data?.preferences) {
          // If preferences exists, check if it's an object with a food property
          const preferences = typeof data.preferences === 'object' 
            ? data.preferences 
            : JSON.parse(String(data.preferences));
            
          // Now safely check if babyFoodEnabled exists in the food preferences
          if (preferences && 
              typeof preferences === 'object' && 
              preferences.food && 
              typeof preferences.food === 'object' && 
              preferences.food.babyFoodEnabled) {
            setBabyFoodEnabled(true);
          } else {
            setBabyFoodEnabled(false);
          }
        } else {
          setBabyFoodEnabled(false);
        }
      } catch (error) {
        console.error("Error checking baby food preferences:", error);
        setBabyFoodEnabled(false);
      }
    };
    
    checkBabyFoodEnabled();
  }, [user]);

  const navigation = [
    { path: '/index', icon: <Home className="w-5 h-5" />, label: 'HOME' },
    { path: '/recipes', icon: <BookOpen className="w-5 h-5" />, label: 'RECIPES' },
    { path: '/recipes/new', icon: <Plus className="w-6 h-6" />, label: '', isSpecial: true },
    { path: '/meal-plan', icon: <Calendar className="w-5 h-5" />, label: 'MEAL PLAN' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'SETTINGS' },
  ];

  // Filter menu items based on preferences
  const getPlusMenuItems = () => {
    const baseItems = [
      { path: '/fridge', icon: <Refrigerator className="w-4 h-4" />, label: 'FRIDGE' },
      { path: '/sous-chef', icon: <ChefHat className="w-4 h-4" />, label: 'SOUS CHEF' },
      { path: '/recipes/new', icon: <BookPlus className="w-4 h-4" />, label: 'ADD RECIPE' },
    ];
    
    if (babyFoodEnabled) {
      baseItems.splice(2, 0, { path: '/baby-food', icon: <Baby className="w-4 h-4" />, label: 'BABY FOOD' });
    }
    
    return baseItems;
  };

  const togglePlusMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPlusMenu(!showPlusMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showPlusMenu) {
        setShowPlusMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPlusMenu]);
  
  // Close menu when navigating
  useEffect(() => {
    setShowPlusMenu(false);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center pb-4 z-50 px-2">
      <nav className="bg-white border-4 border-black rounded-full shadow-neo-medium w-auto max-w-[95%] relative">
        <ul className="flex items-center h-14">
          {navigation.map((item, index) => (
            <li key={item.path} className={index === 2 ? "relative" : ""}>
              {item.isSpecial ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlusMenu(e);
                  }}
                  className={`
                    bg-[#FF6347] text-white rounded-full p-2.5
                    border-4 border-black transform -translate-y-5
                    transition-all duration-300 ease-in-out
                    hover:shadow-[0_0_15px_rgba(255,99,71,0.6)]
                    flex items-center justify-center
                    ${showPlusMenu ? 'rotate-45' : 'hover:rotate-90'}
                  `}
                  aria-label="Quick actions"
                >
                  {item.icon}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex flex-col items-center justify-center px-3 sm:px-4
                    ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}
                  `}
                >
                  {item.icon}
                  <span className="text-xs font-bold hidden sm:inline-block">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Plus menu popup */}
        {showPlusMenu && (
          <div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 flex flex-col gap-2 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {getPlusMenuItems().map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-3 py-1.5 rounded-full
                  border-2 border-black bg-white
                  ${isActive ? 'bg-primary text-white' : 'text-gray-800'}
                  shadow-neo-light hover:shadow-neo-medium
                  transition-all duration-200 transform hover:-translate-y-1
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="bg-[#FF6347] p-1.5 rounded-full">
                  {item.icon}
                </div>
                <span className="font-bold text-xs">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default BottomNav;
