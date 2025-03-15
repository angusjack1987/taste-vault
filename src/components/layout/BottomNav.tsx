
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calendar, ShoppingCart, Settings, UserCog, Palette } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `nav-item ${isActive ? 'nav-item-active' : ''}`
    }
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px]">{label}</span>
  </NavLink>
);

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 px-2">
      <div className="grid grid-cols-6 gap-1 h-full">
        <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
        <NavItem to="/recipes" icon={<BookOpen className="h-5 w-5" />} label="Recipes" />
        <NavItem to="/meal-plan" icon={<Calendar className="h-5 w-5" />} label="Meal Plan" />
        <NavItem to="/shopping" icon={<ShoppingCart className="h-5 w-5" />} label="Shopping" />
        <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        <NavItem to="/design-system" icon={<Palette className="h-5 w-5" />} label="Design" />
      </div>
    </div>
  );
};

export default BottomNav;
