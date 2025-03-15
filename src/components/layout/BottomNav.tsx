
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Book, 
  Plus,
  Calendar,
  Settings,
  BookPlus, 
  ShoppingCart, 
  Refrigerator,
  Baby 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/recipes", label: "Recipes", Icon: Book },
  // Plus button will go here in the UI, but not in this array
  { to: "/meal-plan", label: "Meal Plan", Icon: Calendar },
  { to: "/settings", label: "Settings", Icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const [babyFoodEnabled, setBabyFoodEnabled] = useState(false);

  useEffect(() => {
    const fetchBabyFoodPreference = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.preferences) {
          // Check if preferences is an object and not a string
          const prefs = typeof data.preferences === 'object' ? data.preferences : {};
          
          // Only access food property if preferences is an object
          if (prefs && typeof prefs === 'object' && 'food' in prefs && 
              typeof prefs.food === 'object' && prefs.food && 'babyFoodEnabled' in prefs.food) {
            setBabyFoodEnabled(true);
          }
        }
      } catch (error) {
        console.error("Error fetching baby food preference:", error);
      }
    };
    
    fetchBabyFoodPreference();
  }, [user]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full px-4">
      <div className="grid grid-cols-5 items-center bg-white border-2 border-black text-black rounded-2xl py-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-md">
        {/* First navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[0].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              pathname === navItems[0].to ? "text-primary font-black" : "text-black font-bold"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[0].Icon, { 
                className: cn(
                  "w-5 h-5 mb-0.5 transition-all",
                  pathname === navItems[0].to 
                    ? "text-primary" 
                    : "text-black"
                ),
                strokeWidth: 2.5
              })}
            </div>
            <span className="text-[10px] uppercase">{navItems[0].label}</span>
          </Link>
        </div>

        {/* Second navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[1].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[1].to || (navItems[1].to !== "/" && pathname.startsWith(navItems[1].to)))
                ? "text-primary font-black" 
                : "text-black font-bold"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[1].Icon, { 
                className: cn(
                  "w-5 h-5 mb-0.5 transition-all",
                  (pathname === navItems[1].to || (navItems[1].to !== "/" && pathname.startsWith(navItems[1].to)))
                    ? "text-primary" 
                    : "text-black"
                ),
                strokeWidth: 2.5
              })}
            </div>
            <span className="text-[10px] uppercase">{navItems[1].label}</span>
          </Link>
        </div>

        {/* Center Action Button */}
        <div className="flex justify-center relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 transition-all border-2 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 group">
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-56 mb-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl animate-in">
              <Link to="/recipes/new">
                <DropdownMenuItem className="cursor-pointer rounded-md group font-bold">
                  <BookPlus className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                  Add Recipe
                </DropdownMenuItem>
              </Link>
              <Link to="/fridge">
                <DropdownMenuItem className="cursor-pointer rounded-md group font-bold">
                  <Refrigerator className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                  Fridge
                </DropdownMenuItem>
              </Link>
              <Link to="/shopping">
                <DropdownMenuItem className="cursor-pointer rounded-md group font-bold">
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                  Shopping List
                </DropdownMenuItem>
              </Link>
              {babyFoodEnabled && (
                <Link to="/baby-food">
                  <DropdownMenuItem className="cursor-pointer rounded-md group font-bold">
                    <Baby className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                    Baby Food
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Third navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[2].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[2].to || (navItems[2].to !== "/" && pathname.startsWith(navItems[2].to)))
                ? "text-primary font-black" 
                : "text-black font-bold"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[2].Icon, { 
                className: cn(
                  "w-5 h-5 mb-0.5 transition-all",
                  (pathname === navItems[2].to || (navItems[2].to !== "/" && pathname.startsWith(navItems[2].to)))
                    ? "text-primary" 
                    : "text-black"
                ),
                strokeWidth: 2.5
              })}
            </div>
            <span className="text-[10px] uppercase">{navItems[2].label}</span>
          </Link>
        </div>

        {/* Fourth navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[3].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[3].to || (navItems[3].to !== "/" && pathname.startsWith(navItems[3].to)))
                ? "text-primary font-black" 
                : "text-black font-bold"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[3].Icon, { 
                className: cn(
                  "w-5 h-5 mb-0.5 transition-all",
                  (pathname === navItems[3].to || (navItems[3].to !== "/" && pathname.startsWith(navItems[3].to)))
                    ? "text-primary" 
                    : "text-black"
                ),
                strokeWidth: 2.5
              })}
            </div>
            <span className="text-[10px] uppercase">{navItems[3].label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
