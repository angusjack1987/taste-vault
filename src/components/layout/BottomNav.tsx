
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Book, 
  Plus,
  Calendar,
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookPlus, ShoppingCart, Refrigerator } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/recipes", label: "Recipes", icon: Book },
  // Plus button will go here in the UI, but not in this array
  { to: "/meal-plan", label: "Meal Plan", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg relative">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.to || 
                          (item.to !== "/" && pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center px-4 py-1",
                isActive ? "text-secondary" : "text-primary-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive ? "text-secondary" : "text-primary-foreground"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Center Plus Button */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-14 h-14 rounded-full bg-mint-600 hover:bg-mint-700 transition-colors border-2 border-mint-700 text-white shadow-lg">
                <Plus className="w-7 h-7" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="w-56 mb-2">
              <Link to="/recipes/new">
                <DropdownMenuItem className="cursor-pointer">
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Recipe
                </DropdownMenuItem>
              </Link>
              <Link to="/fridge">
                <DropdownMenuItem className="cursor-pointer">
                  <Refrigerator className="h-4 w-4 mr-2" />
                  Fridge
                </DropdownMenuItem>
              </Link>
              <Link to="/shopping">
                <DropdownMenuItem className="cursor-pointer">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shopping List
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.to || 
                          (item.to !== "/" && pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center px-4 py-1",
                isActive ? "text-secondary" : "text-primary-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive ? "text-secondary" : "text-primary-foreground"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
