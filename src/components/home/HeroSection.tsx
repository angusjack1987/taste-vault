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
  return <section className="mt-6">
      <h1 className="text-3xl font-bold mb-1 neo-text-chunky my-[22px]">Good day, {firstName}!</h1>
      
      
      <div className="grid grid-cols-2 gap-5 mb-8">
        <Link to="/recipes" className="block">
          <div className="section-pink h-full flex flex-col items-center justify-center my-0 py-0">
            <Utensils className="h-8 w-8 mb-3" strokeWidth={3} />
            <p className="text-4xl font-black">{recipesCount}</p>
            <p className="font-extrabold uppercase text-sm mt-1">Recipes</p>
          </div>
        </Link>
        
        <Link to="/meal-plan" className="block">
          <div className="section-green h-full flex flex-col items-center justify-center py-6">
            <Calendar className="h-8 w-8 mb-3" strokeWidth={3} />
            <p className="text-4xl font-black">{todaysMealsCount}</p>
            <p className="font-extrabold uppercase text-sm mt-1">Today's Meals</p>
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-5">
        <Link to="/recipes" className="block">
          <div className="section-blue h-full flex flex-col items-center justify-center py-6">
            <Clock className="h-8 w-8 mb-3" strokeWidth={3} />
            <p className="text-4xl font-black">{avgCookTime}</p>
            <p className="font-extrabold uppercase text-sm mt-1">Avg. Cook Time</p>
          </div>
        </Link>
        
        <button onClick={onOpenSuggestDialog} className="block w-full">
          <div className="section-yellow h-full flex flex-col items-center justify-center py-6">
            <Sparkles className="h-8 w-8 mb-3 animate-character" strokeWidth={3} />
            <p className="text-4xl font-black">AI</p>
            <p className="font-extrabold uppercase text-sm mt-1">Recipe Ideas</p>
          </div>
        </button>
      </div>
    </section>;
};
export default HeroSection;