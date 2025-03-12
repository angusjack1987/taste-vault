
import { useState, useEffect } from "react";
import { Calendar, Plus, X } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans from "@/hooks/useMealPlans";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const MealPlan = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<Date | null>(null);
  const [currentMealType, setCurrentMealType] = useState<"breakfast" | "lunch" | "dinner" | null>(null);

  // Get the start of the current week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  // Fetch recipes and meal plans
  const { useAllRecipes } = useRecipes();
  const { data: recipes, isLoading: recipesLoading } = useAllRecipes();
  
  const { 
    useMealPlansForRange, 
    useCreateMealPlan, 
    useDeleteMealPlan 
  } = useMealPlans();
  
  const { 
    data: mealPlans, 
    isLoading: mealPlansLoading 
  } = useMealPlansForRange(weekStart, weekEnd);
  
  const { mutateAsync: createMealPlan } = useCreateMealPlan();
  const { mutateAsync: deleteMealPlan } = useDeleteMealPlan();
  
  // Generate an array of 7 days starting from weekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    
    // Find meal plans for this day
    const dayMealPlans = mealPlans?.filter(
      meal => format(new Date(meal.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ) || [];
    
    // Group meal plans by meal type
    const meals = {
      breakfast: dayMealPlans.find(m => m.meal_type === "breakfast"),
      lunch: dayMealPlans.find(m => m.meal_type === "lunch"),
      dinner: dayMealPlans.find(m => m.meal_type === "dinner"),
    };
    
    return {
      date,
      meals,
    };
  });
  
  const handleAddMeal = (date: Date, mealType: "breakfast" | "lunch" | "dinner") => {
    setCurrentDay(date);
    setCurrentMealType(mealType);
    setAddMealOpen(true);
  };
  
  const handleSelectRecipe = async (recipeId: string) => {
    if (!currentDay || !currentMealType) return;
    
    try {
      await createMealPlan({
        date: currentDay,
        meal_type: currentMealType,
        recipe_id: recipeId,
      });
      
      setAddMealOpen(false);
      toast.success("Recipe added to meal plan");
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
      toast.error("Failed to add recipe to meal plan");
    }
  };
  
  const handleRemoveMeal = async (mealPlanId: string) => {
    try {
      await deleteMealPlan(mealPlanId);
      toast.success("Recipe removed from meal plan");
    } catch (error) {
      console.error("Error removing meal from plan:", error);
      toast.error("Failed to remove recipe from meal plan");
    }
  };
  
  const isLoading = recipesLoading || mealPlansLoading;
  
  return (
    <MainLayout 
      title="Meal Plan" 
      action={
        <Button variant="ghost" size="icon">
          <Calendar className="h-5 w-5" />
        </Button>
      }
    >
      <div className="page-container">
        {/* Days of the week - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-7 gap-2 text-center text-sm mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Desktop View - Grid layout */}
        <div className="hidden md:grid md:grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={format(day.date, 'yyyy-MM-dd')}
              className="border border-border rounded-lg p-2 min-h-[200px]"
            >
              <div className="text-sm font-medium mb-2">
                {format(day.date, 'MMM d')}
              </div>
              
              <div className="space-y-2">
                {Object.entries(day.meals).map(([mealType, mealPlan]) => (
                  <div key={mealType} className="text-left">
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
                          onClick={() => handleRemoveMeal(mealPlan.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => handleAddMeal(day.date, mealType as "breakfast" | "lunch" | "dinner")}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile View - List layout */}
        <div className="md:hidden space-y-4">
          {weekDays.map((day) => (
            <div
              key={format(day.date, 'yyyy-MM-dd')}
              className="border border-border rounded-lg p-3"
            >
              <div className="text-base font-medium mb-3 pb-2 border-b">
                {format(day.date, 'EEEE, MMM d')}
              </div>
              
              <div className="space-y-3">
                {Object.entries(day.meals).map(([mealType, mealPlan]) => (
                  <div key={mealType} className="text-left">
                    <div className="text-sm text-muted-foreground capitalize mb-1 flex justify-between items-center">
                      <span>{mealType}</span>
                      {!mealPlan && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => handleAddMeal(day.date, mealType as "breakfast" | "lunch" | "dinner")}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
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
                          onClick={() => handleRemoveMeal(mealPlan.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-4">
              Based on your meal plan, you'll need:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>350g spaghetti</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>2 avocados</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>6 large eggs</span>
              </li>
              {/* More items would be listed here */}
            </ul>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                View Full Shopping List
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recipe Selection Dialog */}
      <Dialog open={addMealOpen} onOpenChange={setAddMealOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Select Recipe for {currentMealType ? currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1) : ''} 
              {currentDay ? ` - ${format(currentDay, 'MMM d, yyyy')}` : ''}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {recipes && recipes.length > 0 ? (
              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-16 h-16 rounded-md object-cover" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{recipe.title}</h3>
                      {recipe.time && (
                        <p className="text-sm text-muted-foreground">{recipe.time} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't created any recipes yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  asChild
                >
                  <a href="/recipes/new">Create Recipe</a>
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MealPlan;
