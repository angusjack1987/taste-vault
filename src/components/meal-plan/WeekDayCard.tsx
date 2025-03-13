
import { format } from 'date-fns';
import { Plus, Lightbulb, X, Utensils, ShoppingCart, Refrigerator, BookPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';
import { useNavigate } from 'react-router-dom';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const navigate = useNavigate();
  
  const renderMealSlot = (mealType: MealType, meal?: MealPlanWithRecipe) => {
    if (!meal) {
      return (
        <div className="border border-dashed border-border rounded p-2 flex justify-center items-center gap-1.5 min-h-[60px] bg-background/50 hover:bg-background transition-colors">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="flex flex-col p-0 rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start px-3 py-2 h-auto text-xs gap-2 rounded-none hover:bg-accent"
                  onClick={() => onAddMeal(date, mealType)}
                >
                  <BookPlus className="h-3.5 w-3.5" />
                  Add Recipe
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start px-3 py-2 h-auto text-xs gap-2 rounded-none hover:bg-accent"
                  onClick={() => navigate('/fridge')}
                >
                  <Refrigerator className="h-3.5 w-3.5" />
                  Fridge
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start px-3 py-2 h-auto text-xs gap-2 rounded-none hover:bg-accent"
                  onClick={() => navigate('/shopping')}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Shopping List
                </Button>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
            onClick={() => onSuggestMeal(date, mealType)}
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="border rounded p-2 bg-card min-h-[60px] relative hover:shadow-sm transition-shadow">
        <div className="text-xs font-medium line-clamp-2 pr-6">
          {meal.recipe?.title || (
            <span className="flex items-center text-muted-foreground">
              <Utensils className="h-3 w-3 mr-1" /> No recipe selected
            </span>
          )}
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
      "border rounded p-2 space-y-1 transition-all",
      isToday ? "border-primary bg-primary/5 shadow-sm" : "hover:border-muted-foreground/30"
    )}>
      <div className={cn(
        "text-center mb-2 font-medium text-sm",
        isToday && "text-primary"
      )}>
        {format(date, 'd')}
      </div>
      
      {renderMealSlot('breakfast', meals.breakfast)}
      {renderMealSlot('lunch', meals.lunch)}
      {renderMealSlot('dinner', meals.dinner)}
    </div>
  );
};

export default WeekDayCard;
