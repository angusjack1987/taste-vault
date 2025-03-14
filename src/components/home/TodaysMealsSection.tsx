
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
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Today's Meals</h2>
        <Link to="/meal-plan" className="text-sm font-medium flex items-center">
          View all <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="playful-card">
        {meals.map((meal) => (
          <div key={meal.id} className="mb-3 last:mb-0">
            <h3 className="font-medium text-sm text-muted-foreground capitalize mb-1">
              {meal.meal_type}
            </h3>
            {meal.recipe ? (
              <Link to={`/recipes/${meal.recipe.id}`} className="block">
                <div className="flex items-center gap-3">
                  {meal.recipe.image ? (
                    <img 
                      src={meal.recipe.image} 
                      alt={meal.recipe.title}
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{meal.recipe.title}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link to="/meal-plan" className="block">
                <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" />
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
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default TodaysMealsSection;
