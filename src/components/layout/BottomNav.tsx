
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Book, 
  Calendar,
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/recipes", label: "Recipes", icon: Book },
  { to: "/meal-plan", label: "Meal Plan", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg">
        {navItems.map((item) => {
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
