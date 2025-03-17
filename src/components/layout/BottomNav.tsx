
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Plus, Calendar, Settings } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navigation = [
    { path: '/index', icon: <Home className="w-5 h-5" />, label: 'HOME' },
    { path: '/recipes', icon: <BookOpen className="w-5 h-5" />, label: 'RECIPES' },
    { path: '/recipes/new', icon: <Plus className="w-6 h-6" />, label: '' },
    { path: '/meal-plan', icon: <Calendar className="w-5 h-5" />, label: 'MEAL PLAN' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'SETTINGS' },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black rounded-full shadow-neo-medium z-50">
      <ul className="flex items-center h-16">
        {navigation.map((item, index) => (
          <li key={item.path} className={index === 2 ? "relative" : ""}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center px-5
                ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'}
                ${index === 2 ? 'bg-[#FF6347] text-white rounded-full p-3 shadow-neo-light transform -translate-y-4 border-4 border-black' : ''}
              `}
            >
              {item.icon}
              {item.label && <span className="text-xs font-bold">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
