import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Utensils, Settings } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navigation = [
    { path: '/index', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { path: '/meal-plan', icon: <Calendar className="w-5 h-5" />, label: 'Meal Plan' },
    { path: '/recipes', icon: <Utensils className="w-5 h-5" />, label: 'Recipes' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
      <ul className="flex justify-around items-center h-16">
        {navigation.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-gray-500 hover:text-primary ${
                  isActive ? 'text-primary' : ''
                }`
              }
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
