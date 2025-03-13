
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30">
      <div className="flex items-center justify-between px-2 py-3 max-w-5xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.to || 
                          (item.to !== "/" && pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "nav-item p-2",
                isActive ? "nav-item-active" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
