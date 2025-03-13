
import { format } from 'date-fns';
import { Plus, Lightbulb, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  
  const renderMealSlot = (mealType: MealType, meal?: MealPlanWithRecipe) => {
    if (!meal) {
      return (
        <div className="border border-dashed border-border rounded p-2 flex justify-center items-center gap-1.5 min-h-[60px]">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onAddMeal(date, mealType)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onSuggestMeal(date, mealType)}>
            <Lightbulb className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="border rounded p-2 bg-card min-h-[60px] relative">
        <div className="text-xs font-medium line-clamp-2 pr-6">{meal.recipe?.title || 'No recipe selected'}</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute top-1 right-1 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Meal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this meal from your plan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onRemoveMeal(meal.id)}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };
  
  return (
    <div className={cn(
      "border rounded p-2 space-y-1",
      isToday && "border-primary bg-primary/5"
    )}>
      <div className="text-center mb-2 font-medium text-sm">
        {format(date, 'd')}
      </div>
      
      {renderMealSlot('breakfast', meals.breakfast)}
      {renderMealSlot('lunch', meals.lunch)}
      {renderMealSlot('dinner', meals.dinner)}
    </div>
  );
};

export default WeekDayCard;
