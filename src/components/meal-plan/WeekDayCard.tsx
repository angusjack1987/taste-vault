
import React from 'react';
import { format } from 'date-fns';
import { Plus, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';

interface MealSlotProps {
  mealType: MealType;
  mealPlan: MealPlanWithRecipe | undefined;
  onAddMeal: () => void;
  onRemoveMeal: (id: string) => void;
  onSuggestMeal: () => void;
}

const MealSlot = ({ mealType, mealPlan, onAddMeal, onRemoveMeal, onSuggestMeal }: MealSlotProps) => {
  return (
    <div className="text-left">
      <div className="text-xs text-muted-foreground capitalize mb-1">
        {mealType}
      </div>
      {mealPlan ? (
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1 group">
          {mealPlan.recipe?.image && (
            <img
              src={mealPlan.recipe.image}
              alt={mealPlan.recipe.title}
              className="w-8 h-8 rounded object-cover"
            />
          )}
          <span className="text-xs line-clamp-2 flex-1">
            {mealPlan.recipe?.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveMeal(mealPlan.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={onAddMeal}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-2"
            onClick={onSuggestMeal}
          >
            <Lightbulb className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface WeekDayCardProps {
  date: Date;
  meals: {
    breakfast?: MealPlanWithRecipe;
    lunch?: MealPlanWithRecipe;
    dinner?: MealPlanWithRecipe;
  };
  onAddMeal: (date: Date, mealType: MealType) => void;
  onRemoveMeal: (mealPlanId: string) => void;
  onSuggestMeal: (date: Date, mealType: MealType) => void;
}

const WeekDayCard = ({ date, meals, onAddMeal, onRemoveMeal, onSuggestMeal }: WeekDayCardProps) => {
  return (
    <div className="border border-border rounded-lg p-2 min-h-[200px]">
      <div className="text-sm font-medium mb-2">
        {format(date, 'MMM d')}
      </div>
      
      <div className="space-y-2">
        {Object.entries(meals).map(([mealType, mealPlan]) => (
          <MealSlot
            key={mealType}
            mealType={mealType as MealType}
            mealPlan={mealPlan}
            onAddMeal={() => onAddMeal(date, mealType as MealType)}
            onRemoveMeal={onRemoveMeal}
            onSuggestMeal={() => onSuggestMeal(date, mealType as MealType)}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekDayCard;
