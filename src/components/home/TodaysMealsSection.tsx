
import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Meal {
  id: string;
  meal_type: string;
  recipe: {
    id: string;
    title: string;
    image: string | null;
  } | null;
}

interface TodaysMealsSectionProps {
  meals: Meal[];
}

const TodaysMealsSection = ({ meals }: TodaysMealsSectionProps) => {
  if (meals.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-5 p-4 section-green">
        <h2 className="text-xl font-black uppercase">Today's Meals</h2>
        <Link to="/meal-plan" className="text-sm font-bold uppercase flex items-center bg-white px-3 py-2 neo-border shadow-neo-light hover:shadow-neo-medium hover:-translate-x-1 hover:-translate-y-1 transition-all">
          View all <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="section-pink rounded-xl">
        {meals.map((meal, index) => (
          <div key={meal.id} className={`${index !== 0 ? 'mt-5 pt-5 border-t-4 border-black' : ''}`}>
            <h3 className="font-extrabold text-sm uppercase mb-3 bg-black text-white inline-block px-3 py-1">
              {meal.meal_type}
            </h3>
            {meal.recipe ? (
              <Link to={`/recipes/${meal.recipe.id}`} className="block">
                <div className="flex items-center gap-4 bg-white p-3 border-4 border-black shadow-neo-light hover:shadow-neo-medium hover:-translate-x-1 hover:-translate-y-1 transition-all">
                  {meal.recipe.image ? (
                    <img 
                      src={meal.recipe.image} 
                      alt={meal.recipe.title}
                      className="w-16 h-16 object-cover border-4 border-black" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-yellow-300 flex items-center justify-center border-4 border-black">
                      <ChefHat className="h-8 w-8" strokeWidth={3} />
                    </div>
                  )}
                  <div>
                    <p className="font-black text-lg">{meal.recipe.title}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link to="/meal-plan" className="block">
                <div className="rounded-xl p-4 border-4 border-dashed border-black flex items-center justify-center bg-white">
                  <Button variant="ghost" size="lg" className="rounded-none font-black uppercase border-4 border-black hover:bg-yellow-300">
                    <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                    Add {meal.meal_type}
                  </Button>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default TodaysMealsSection;
