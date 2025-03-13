
import React from 'react';
import { format } from 'date-fns';
import { Plus, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';

interface MobileMealSlotProps {
  mealType: MealType;
  mealPlan: MealPlanWithRecipe | undefined;
  onAddMeal: () => void;
  onRemoveMeal: (id: string) => void;
  onSuggestMeal: () => void;
}

const MobileMealSlot = ({ mealType, mealPlan, onAddMeal, onRemoveMeal, onSuggestMeal }: MobileMealSlotProps) => {
  return (
    <div className="text-left">
      <div className="text-sm text-muted-foreground capitalize mb-1 flex justify-between items-center">
        <span>{mealType}</span>
        {!mealPlan && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={onAddMeal}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={onSuggestMeal}
            >
              <Lightbulb className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      {mealPlan && (
        <div className="flex items-center gap-3 bg-muted rounded-lg p-2 relative group">
          {mealPlan.recipe?.image && (
            <img
              src={mealPlan.recipe.image}
              alt={mealPlan.recipe.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <span className="text-sm flex-1">
            {mealPlan.recipe?.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 absolute right-1 top-1"
            onClick={() => onRemoveMeal(mealPlan.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface MobileDayCardProps {
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

const MobileDayCard = ({ date, meals, onAddMeal, onRemoveMeal, onSuggestMeal }: MobileDayCardProps) => {
  return (
    <div className="border border-border rounded-lg p-3">
      <div className="text-base font-medium mb-3 pb-2 border-b">
        {format(date, 'EEEE, MMM d')}
      </div>
      
      <div className="space-y-3">
        {Object.entries(meals).map(([mealType, mealPlan]) => (
          <MobileMealSlot
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

export default MobileDayCard;
