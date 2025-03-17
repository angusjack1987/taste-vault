
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Plus, Calendar, Settings, Refrigerator, ChefHat, Baby, BookPlus } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const navigation = [
    { path: '/index', icon: <Home className="w-5 h-5" />, label: 'HOME' },
    { path: '/recipes', icon: <BookOpen className="w-5 h-5" />, label: 'RECIPES' },
    { path: '/recipes/new', icon: <Plus className="w-6 h-6" />, label: '', isSpecial: true },
    { path: '/meal-plan', icon: <Calendar className="w-5 h-5" />, label: 'MEAL PLAN' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'SETTINGS' },
  ];

  const plusMenuItems = [
    { path: '/fridge', icon: <Refrigerator className="w-5 h-5" />, label: 'FRIDGE' },
    { path: '/sous-chef', icon: <ChefHat className="w-5 h-5" />, label: 'SOUS CHEF' },
    { path: '/baby-food', icon: <Baby className="w-5 h-5" />, label: 'BABY FOOD' },
    { path: '/recipes/new', icon: <BookPlus className="w-5 h-5" />, label: 'ADD RECIPE' },
  ];

  const togglePlusMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPlusMenu(!showPlusMenu);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center pb-4 z-50 px-2">
      <nav className="bg-white border-4 border-black rounded-full shadow-neo-medium max-w-[95%] relative">
        <ul className="flex items-center h-16">
          {navigation.map((item, index) => (
            <li key={item.path} className={index === 2 ? "relative" : ""}>
              {item.isSpecial ? (
                <button
                  onClick={togglePlusMenu}
                  className={`
                    bg-[#FF6347] text-white rounded-full p-3 
                    border-4 border-black transform -translate-y-6
                    transition-all duration-300 hover:rotate-90
                    hover:shadow-[0_0_15px_rgba(255,99,71,0.6)]
                    flex items-center justify-center
                    ${showPlusMenu ? 'rotate-45' : ''}
                  `}
                  aria-label="Quick actions"
                >
                  {item.icon}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex flex-col items-center justify-center px-4 sm:px-5
                    ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}
                  `}
                >
                  {item.icon}
                  {item.label && <span className="text-xs font-bold">{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Plus menu popup */}
        {showPlusMenu && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 flex flex-col gap-3 items-center">
            {plusMenuItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-full
                  border-2 border-black bg-white
                  ${isActive ? 'bg-primary text-white' : 'text-gray-800'}
                  shadow-neo-light hover:shadow-neo-medium
                  transition-all duration-200 transform hover:-translate-y-1
                  animate-fade-in
                  style="--animation-delay: ${index * 0.05}s"
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setShowPlusMenu(false)}
              >
                <div className="bg-[#FF6347] p-2 rounded-full">
                  {item.icon}
                </div>
                <span className="font-bold text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default BottomNav;
