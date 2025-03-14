
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
  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  
  const renderMealSlot = (mealType: MealType, meal?: MealPlanWithRecipe) => {
    if (!meal) {
      return (
        <div className="flex-1 border border-dashed border-border rounded-md p-2 flex justify-between items-center min-h-[48px]">
          <div className="text-sm capitalize text-muted-foreground">{mealType}</div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={() => onAddMeal(date, mealType)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 px-0" 
              onClick={() => onSuggestMeal(date, mealType)}
              title="Get AI suggestion"
              type="button"
            >
              <Lightbulb className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex-1 border rounded-md p-2 bg-card relative">
        <div className="flex justify-between items-center">
          <div className="text-sm capitalize text-muted-foreground">{mealType}</div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
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
        <div className="font-medium mt-1">{meal.recipe?.title || 'No recipe selected'}</div>
      </div>
    );
  };
  
  return (
    <div className={cn(
      "border rounded-lg p-3 space-y-3",
      isToday && "border-primary bg-primary/5"
    )}>
      <div className="font-medium">
        {format(date, 'EEEE, MMMM d')}
        {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>}
      </div>
      
      <div className="space-y-2">
        {renderMealSlot('breakfast', meals.breakfast)}
        {renderMealSlot('lunch', meals.lunch)}
        {renderMealSlot('dinner', meals.dinner)}
      </div>
    </div>
  );
};

export default MobileDayCard;
