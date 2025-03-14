
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

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full px-4">
      <div className="grid grid-cols-5 items-center bg-gradient-to-r from-primary/95 via-primary to-primary/95 text-primary-foreground rounded-full py-1 shadow-vibrant mx-auto max-w-md">
        {/* First navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[0].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              pathname === navItems[0].to ? "text-secondary" : "text-primary-foreground"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[0].Icon, { 
                className: cn(
                  "w-4 h-4 mb-0.5 transition-all",
                  pathname === navItems[0].to ? "text-secondary animate-pulse-slow" : "text-primary-foreground"
                )
              })}
            </div>
            <span className="text-[10px] font-medium">{navItems[0].label}</span>
          </Link>
        </div>

        {/* Second navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[1].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[1].to || (navItems[1].to !== "/" && pathname.startsWith(navItems[1].to)))
                ? "text-secondary" 
                : "text-primary-foreground"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[1].Icon, { 
                className: cn(
                  "w-4 h-4 mb-0.5 transition-all",
                  (pathname === navItems[1].to || (navItems[1].to !== "/" && pathname.startsWith(navItems[1].to)))
                    ? "text-secondary animate-pulse-slow" 
                    : "text-primary-foreground"
                )
              })}
            </div>
            <span className="text-[10px] font-medium">{navItems[1].label}</span>
          </Link>
        </div>

        {/* Center Action Button */}
        <div className="flex justify-center relative">
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

        {/* Third navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[2].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[2].to || (navItems[2].to !== "/" && pathname.startsWith(navItems[2].to)))
                ? "text-secondary" 
                : "text-primary-foreground"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[2].Icon, { 
                className: cn(
                  "w-4 h-4 mb-0.5 transition-all",
                  (pathname === navItems[2].to || (navItems[2].to !== "/" && pathname.startsWith(navItems[2].to)))
                    ? "text-secondary animate-pulse-slow" 
                    : "text-primary-foreground"
                )
              })}
            </div>
            <span className="text-[10px] font-medium">{navItems[2].label}</span>
          </Link>
        </div>

        {/* Fourth navigation item */}
        <div className="flex justify-center">
          <Link
            to={navItems[3].to}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 transition-all hover:scale-110",
              (pathname === navItems[3].to || (navItems[3].to !== "/" && pathname.startsWith(navItems[3].to)))
                ? "text-secondary" 
                : "text-primary-foreground"
            )}
          >
            <div className="flex justify-center w-full">
              {React.createElement(navItems[3].Icon, { 
                className: cn(
                  "w-4 h-4 mb-0.5 transition-all",
                  (pathname === navItems[3].to || (navItems[3].to !== "/" && pathname.startsWith(navItems[3].to)))
                    ? "text-secondary animate-pulse-slow" 
                    : "text-primary-foreground"
                )
              })}
            </div>
            <span className="text-[10px] font-medium">{navItems[3].label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
