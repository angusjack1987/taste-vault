
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Sparkles, Utensils } from 'lucide-react';

interface HeroSectionProps {
  firstName: string;
  recipesCount: number;
  todaysMealsCount: number;
  avgCookTime: number;
  onOpenSuggestDialog: () => void;
}

const HeroSection = ({
  firstName,
  recipesCount,
  todaysMealsCount,
  avgCookTime,
  onOpenSuggestDialog
}: HeroSectionProps) => {
  return (
    <section className="mt-6">
      <h1 className="text-2xl font-bold mb-1">Good day, {firstName}!</h1>
      <p className="text-3xl font-bold mb-6">What shall we cook today?</p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/recipes" className="block">
          <div className="stat-card stat-card-yellow rounded-2xl h-full">
            <Utensils className="h-6 w-6 mb-2" />
            <p className="stat-card-icon">{recipesCount}</p>
            <p className="stat-card-label">Recipes</p>
          </div>
        </Link>
        
        <Link to="/meal-plan" className="block">
          <div className="stat-card stat-card-green rounded-2xl h-full">
            <Calendar className="h-6 w-6 mb-2" />
            <p className="stat-card-icon">{todaysMealsCount}</p>
            <p className="stat-card-label">Today's Meals</p>
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Link to="/recipes" className="block">
          <div className="stat-card stat-card-blue rounded-2xl h-full">
            <Clock className="h-6 w-6 mb-2" />
            <p className="stat-card-icon">{avgCookTime}</p>
            <p className="stat-card-label">Avg. Cook Time</p>
          </div>
        </Link>
        
        <button onClick={onOpenSuggestDialog} className="block w-full">
          <div className="stat-card stat-card-black rounded-2xl h-full">
            <Sparkles className="h-6 w-6 mb-2" />
            <p className="stat-card-icon">AI</p>
            <p className="stat-card-label">Recipe Ideas</p>
          </div>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
