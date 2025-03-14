
import { format } from 'date-fns';
import { Plus, Lightbulb, X, Utensils, Coffee, Salad, ChefHat } from 'lucide-react';
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

const getMealIcon = (mealType: MealType) => {
  switch (mealType) {
    case 'breakfast':
      return <Coffee className="h-3.5 w-3.5 mr-1" />;
    case 'lunch':
      return <Salad className="h-3.5 w-3.5 mr-1" />;
    case 'dinner':
      return <ChefHat className="h-3.5 w-3.5 mr-1" />;
    default:
      return <Utensils className="h-3.5 w-3.5 mr-1" />;
  }
};

const WeekDayCard = ({ date, meals, onAddMeal, onRemoveMeal, onSuggestMeal }: WeekDayCardProps) => {
  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  
  const renderMealSlot = (mealType: MealType, meal?: MealPlanWithRecipe) => {
    if (!meal) {
      return (
        <div className="border border-dashed border-border rounded-md p-2 flex justify-center items-center gap-1.5 min-h-[70px] bg-background/50 hover:bg-background transition-colors">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs group" onClick={() => onAddMeal(date, mealType)}>
            <Plus className="h-3.5 w-3.5 mr-1 group-hover:animate-spin-slow" />
            {getMealIcon(mealType)}
            <span className="hidden sm:inline">{mealType}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 px-0 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-50 group" onClick={() => onSuggestMeal(date, mealType)}>
            <Lightbulb className="h-3.5 w-3.5 group-hover:animate-pulse-slow" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="border rounded-md p-2 bg-card min-h-[70px] relative hover:shadow-sm transition-shadow group">
        <div className="text-xs font-medium line-clamp-2 pr-6 flex items-start">
          <span className="mt-0.5">{getMealIcon(mealType)}</span>
          <span className="flex-1">
            {meal.recipe?.title || (
              <span className="flex items-center text-muted-foreground">
                <Utensils className="h-3 w-3 mr-1 group-hover:animate-pulse-slow" /> No recipe selected
              </span>
            )}
          </span>
        </div>
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
      "border rounded-lg p-2 space-y-2 transition-all",
      isToday ? "border-primary bg-primary/5 shadow-sm" : "hover:border-muted-foreground/30"
    )}>
      <div className={cn(
        "text-center mb-2 font-medium flex flex-col",
        isToday && "text-primary"
      )}>
        <span className="text-sm">{format(date, 'EEE')}</span>
        <span className="text-lg">{format(date, 'd')}</span>
      </div>
      
      {renderMealSlot('breakfast', meals.breakfast)}
      {renderMealSlot('lunch', meals.lunch)}
      {renderMealSlot('dinner', meals.dinner)}
    </div>
  );
};

export default WeekDayCard;
