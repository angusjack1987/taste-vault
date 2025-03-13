import { useState, useEffect } from "react";
import { Calendar, Plus, X, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans from "@/hooks/useMealPlans";
import useAiRecipes from "@/hooks/useAiRecipes"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MealPlan = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<Date | null>(null);
  const [currentMealType, setCurrentMealType] = useState<"breakfast" | "lunch" | "dinner" | null>(null);
  
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [preferences, setPreferences] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [suggestions, setSuggestions] = useState<string | null>(null);
  
  const [suggestMealOpen, setSuggestMealOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  const { useAllRecipes, useCreateRecipe } = useRecipes();
  const { data: recipes, isLoading: recipesLoading } = useAllRecipes();
  const { mutateAsync: createRecipe } = useCreateRecipe();
  
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
  
  const { suggestRecipes, analyzeMealPlan, suggestMealForPlan, loading: aiLoading } = useAiRecipes();
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    
    const dayMealPlans = mealPlans?.filter(
      meal => format(new Date(meal.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ) || [];
    
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

  const handleGetAiSuggestions = async () => {
    setSuggestions(null);
    
    try {
      const result = await suggestRecipes({
        preferences,
        dietaryRestrictions
      });
      
      if (result) {
        setSuggestions(result);
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }
  };
  
  const handleSuggestMeal = async () => {
    setSuggestedMeal(null);
    
    try {
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences
      });
      
      if (result) {
        setParsingMealSuggestion(true);
        try {
          let cleanJson = result;
          if (result.includes("```json")) {
            cleanJson = result.split("```json")[1].split("```")[0].trim();
          } else if (result.includes("```")) {
            cleanJson = result.split("```")[1].split("```")[0].trim();
          }
          
          const parsedMeal = JSON.parse(cleanJson);
          setSuggestedMeal(parsedMeal);
        } catch (parseError) {
          console.error("Error parsing suggestion:", parseError);
          setSuggestedMeal({ 
            title: "Parsing Error", 
            description: "Could not parse the suggestion properly. Here's the raw response:", 
            rawResponse: result 
          });
        }
        setParsingMealSuggestion(false);
      }
    } catch (error) {
      console.error("Error getting meal suggestion:", error);
      setParsingMealSuggestion(false);
    }
  };
  
  const handleSaveSuggestedRecipe = async () => {
    if (!suggestedMeal) return;
    
    try {
      const newRecipe = await createRecipe({
        title: suggestedMeal.title,
        description: suggestedMeal.description,
        ingredients: suggestedMeal.ingredients || [],
        instructions: suggestedMeal.instructions || [],
        time: suggestedMeal.time || null,
        servings: suggestedMeal.servings || null,
        image: null,
        difficulty: null,
        tags: []
      });
      
      if (currentDay && currentMealType) {
        await createMealPlan({
          date: currentDay,
          meal_type: currentMealType,
          recipe_id: newRecipe.id,
        });
        
        toast.success("Recipe saved and added to meal plan");
      } else {
        toast.success("Recipe saved to your collection");
      }
      
      setSuggestMealOpen(false);
    } catch (error) {
      console.error("Error saving suggested recipe:", error);
      toast.error("Failed to save the recipe");
    }
  };
  
  const openSuggestMealDialog = (date?: Date, mealType?: "breakfast" | "lunch" | "dinner") => {
    setSuggestedMeal(null);
    setAdditionalPreferences("");
    
    if (date) setCurrentDay(date);
    if (mealType) {
      setSuggestMealType(mealType);
      setCurrentMealType(mealType);
    }
    
    setSuggestMealOpen(true);
  };
  
  const isLoading = recipesLoading || mealPlansLoading;
  
  return (
    <MainLayout 
      title="Meal Plan" 
      action={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => openSuggestMealDialog()}
            title="Suggest a meal"
          >
            <Lightbulb className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setAiSuggestionsOpen(true)}
            title="AI recipe suggestions"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="page-container">
        <div className="hidden md:grid md:grid-cols-7 gap-2 text-center text-sm mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => handleAddMeal(day.date, mealType as "breakfast" | "lunch" | "dinner")}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs px-2"
                          onClick={() => openSuggestMealDialog(day.date, mealType as "breakfast" | "lunch" | "dinner")}
                        >
                          <Lightbulb className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleAddMeal(day.date, mealType as "breakfast" | "lunch" | "dinner")}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => openSuggestMealDialog(day.date, mealType as "breakfast" | "lunch" | "dinner")}
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
            </ul>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                View Full Shopping List
              </Button>
            </div>
          </div>
        </div>
      </div>
      
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

      <Dialog open={aiSuggestionsOpen} onOpenChange={setAiSuggestionsOpen}>
        <DialogContent className="max-w-md" scrollable maxHeight="70vh">
          <DialogHeader>
            <DialogTitle>
              AI Recipe Suggestions
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(70vh-120px)] mt-2 -mr-6 pr-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferences">Your Preferences</Label>
                <Input
                  id="preferences"
                  placeholder="e.g., quick meals, Italian cuisine, low carb"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restrictions">Dietary Restrictions</Label>
                <Input
                  id="restrictions"
                  placeholder="e.g., vegetarian, gluten-free, no nuts"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGetAiSuggestions} 
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
              
              {suggestions && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Suggested Recipes:</h3>
                  <div className="text-sm whitespace-pre-line">
                    {suggestions}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={suggestMealOpen} onOpenChange={setSuggestMealOpen}>
        <DialogContent className="max-w-md" scrollable maxHeight="80vh">
          <DialogHeader>
            <DialogTitle>
              AI Meal Suggestion
            </DialogTitle>
            <DialogDescription>
              Get an AI-generated recipe suggestion based on your preferences.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(80vh-140px)] -mr-6 pr-6">
            {!suggestedMeal ? (
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <Select 
                    value={suggestMealType} 
                    onValueChange={(value) => setSuggestMealType(value as "breakfast" | "lunch" | "dinner")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferences">Additional Preferences</Label>
                  <Textarea
                    id="preferences"
                    placeholder="e.g., quick, vegetarian, Italian, etc."
                    value={additionalPreferences}
                    onChange={(e) => setAdditionalPreferences(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSuggestMeal} 
                  disabled={aiLoading}
                  className="w-full"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Suggestion...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Get Suggestion
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {parsingMealSuggestion ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{suggestedMeal.title}</h3>
                      <p className="text-sm text-muted-foreground">{suggestedMeal.description}</p>
                      
                      {suggestedMeal.rawResponse ? (
                        <div className="mt-4 p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                          {suggestedMeal.rawResponse}
                        </div>
                      ) : (
                        <>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {suggestedMeal.ingredients?.map((ingredient: string, idx: number) => (
                                <li key={idx}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Instructions:</h4>
                            <ol className="list-decimal pl-5 text-sm space-y-2">
                              {suggestedMeal.instructions?.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-4 text-sm">
                            {suggestedMeal.time && (
                              <div>
                                <span className="font-medium">Time:</span> {suggestedMeal.time} minutes
                              </div>
                            )}
                            {suggestedMeal.servings && (
                              <div>
                                <span className="font-medium">Servings:</span> {suggestedMeal.servings}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
          
          {suggestedMeal && !parsingMealSuggestion && (
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSuggestedMeal(null)}
                className="sm:flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSaveSuggestedRecipe}
                className="sm:flex-1"
                disabled={!!suggestedMeal.rawResponse}
              >
                {currentDay && currentMealType 
                  ? "Save & Add to Plan" 
                  : "Save Recipe"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MealPlan;
