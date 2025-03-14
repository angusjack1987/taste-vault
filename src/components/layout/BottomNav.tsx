
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

const navItems = [
  { title: "Home", icon: Home, to: "/" },
  { title: "Recipes", icon: Book, to: "/recipes" },
  // Center action button handled separately
  { title: "Meal Plan", icon: Calendar, to: "/meal-plan" },
  { title: "Settings", icon: Settings, to: "/settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Convert navItems to the format expected by ExpandableTabs
  const leftTabs = [
    { title: navItems[0].title, icon: navItems[0].icon, path: navItems[0].to },
    { title: navItems[1].title, icon: navItems[1].icon, path: navItems[1].to },
  ];
  
  const rightTabs = [
    { title: navItems[2].title, icon: navItems[2].icon, path: navItems[2].to },
    { title: navItems[3].title, icon: navItems[3].icon, path: navItems[3].to },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full px-4">
      <div className="bg-gradient-to-r from-primary/95 via-primary to-primary/95 text-primary-foreground rounded-full py-1 shadow-vibrant mx-auto max-w-md">
        <div className="grid grid-cols-5 items-center">
          {/* First two nav items */}
          <div className="col-span-2">
            <ExpandableTabs 
              tabs={leftTabs}
              activeColor="text-secondary"
              className="border-none bg-transparent shadow-none"
            />
          </div>

          {/* Center Action Button */}
          <div className="flex justify-center relative col-span-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 transition-all border-3 border-primary text-white shadow-md hover:-translate-y-1 active:translate-y-0 group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" className="w-56 mb-2 border-2 rounded-xl animate-in">
                <Link to="/recipes/new">
                  <DropdownMenuItem className="cursor-pointer rounded-lg group">
                    <BookPlus className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                    Add Recipe
                  </DropdownMenuItem>
                </Link>
                <Link to="/fridge">
                  <DropdownMenuItem className="cursor-pointer rounded-lg group">
                    <Refrigerator className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                    Fridge
                  </DropdownMenuItem>
                </Link>
                <Link to="/shopping">
                  <DropdownMenuItem className="cursor-pointer rounded-lg group">
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-pulse-slow" />
                    Shopping List
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Last two nav items */}
          <div className="col-span-2">
            <ExpandableTabs 
              tabs={rightTabs}
              activeColor="text-secondary"
              className="border-none bg-transparent shadow-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
