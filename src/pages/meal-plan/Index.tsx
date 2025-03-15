import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Sparkles, Lightbulb, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans, { MealType } from "@/hooks/useMealPlans";
import useAiRecipes from "@/hooks/useAiRecipes";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import WeekView from "@/components/meal-plan/WeekView";
import ShoppingList from "@/components/meal-plan/ShoppingList";
import AddMealDialog from "@/components/meal-plan/dialogs/AddMealDialog";
import AiSuggestionsDialog from "@/components/meal-plan/dialogs/AiSuggestionsDialog";
import SuggestMealDialog from "@/components/meal-plan/dialogs/SuggestMealDialog";
import QuickAddMealDialog from "@/components/meal-plan/dialogs/QuickAddMealDialog";
import PlanWeekDialog from "@/components/meal-plan/dialogs/PlanWeekDialog";

const MealPlan = () => {
  const isMobile = useIsMobile();
  const todayRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<Date | null>(null);
  const [currentMealType, setCurrentMealType] = useState<MealType | null>(null);
  
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  
  const [suggestMealOpen, setSuggestMealOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [suggestMealType, setSuggestMealType] = useState<MealType>("dinner");
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  const [planWeekOpen, setPlanWeekOpen] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  
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
  
  useEffect(() => {
    if (isMobile && todayRef.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isMobile, mealPlansLoading]);
  
  const handleChangeWeek = (newStartDate: Date) => {
    setSelectedDate(newStartDate);
  };
  
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
    
    const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    
    return {
      date,
      meals,
      isToday,
      ref: isToday ? todayRef : null
    };
  });
  
  const handleAddMeal = (date: Date, mealType: MealType) => {
    setCurrentDay(date);
    setCurrentMealType(mealType);
    setAddMealOpen(true);
  };
  
  const handleQuickAddMeal = (date: Date, mealType: MealType) => {
    setCurrentDay(date);
    setCurrentMealType(mealType);
    setQuickAddOpen(true);
  };
  
  const handleSaveQuickMeal = async (note: string) => {
    if (!currentDay || !currentMealType) return;
    
    try {
      await createMealPlan({
        date: currentDay,
        meal_type: currentMealType,
        recipe_id: null,
        note: note
      });
      
      setQuickAddOpen(false);
      toast.success("Meal note added to plan");
    } catch (error) {
      console.error("Error adding meal note to plan:", error);
      toast.error("Failed to add meal note to plan");
    }
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

  const handleGetAiSuggestions = async (preferences: string, dietaryRestrictions: string) => {
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
          if (typeof result === 'object' && result !== null) {
            setSuggestedMeal(result);
          } else if (typeof result === 'string') {
            let cleanJson = result;
            if (result.includes("```json")) {
              cleanJson = result.split("```json")[1].split("```")[0].trim();
            } else if (result.includes("```")) {
              cleanJson = result.split("```")[1].split("```")[0].trim();
            }
            
            try {
              const parsedMeal = JSON.parse(cleanJson);
              setSuggestedMeal(parsedMeal);
            } catch (parseError) {
              console.error("Error parsing suggestion:", parseError);
              setSuggestedMeal({ 
                rawResponse: result 
              });
            }
          } else {
            setSuggestedMeal({ 
              rawResponse: String(result) 
            });
          }
        } catch (error) {
          console.error("Error handling suggestion:", error);
          setSuggestedMeal({ 
            rawResponse: typeof result === 'string' ? result : JSON.stringify(result) 
          });
        }
        setParsingMealSuggestion(false);
      }
    } catch (error) {
      console.error("Error getting meal suggestion:", error);
      toast.error("Failed to get meal suggestions. Please try again.");
      setParsingMealSuggestion(false);
    }
  };
  
  const handleSaveSuggestedRecipe = async (optionIndex: number) => {
    if (!suggestedMeal || !suggestedMeal.options || !suggestedMeal.options[optionIndex]) return;
    
    try {
      const selectedOption = suggestedMeal.options[optionIndex];
      
      const newRecipe = await createRecipe({
        title: selectedOption.title,
        description: selectedOption.description,
        ingredients: selectedOption.ingredients || [],
        instructions: selectedOption.instructions || [],
        time: selectedOption.time || null,
        servings: selectedOption.servings || null,
        image: null,
        difficulty: null,
        tags: [],
        images: [],
        rating: null
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
  
  const openSuggestMealDialog = (date?: Date, mealType?: MealType) => {
    setSuggestedMeal(null);
    setAdditionalPreferences("");
    
    if (date) setCurrentDay(date);
    if (mealType) {
      setSuggestMealType(mealType);
      setCurrentMealType(mealType);
    }
    
    setSuggestMealOpen(true);
  };
  
  const handleGenerateWeeklyPlan = async (selectedDays: any) => {
    setGeneratingPlan(true);
    
    try {
      const mealsToGenerate: { date: string; mealType: MealType }[] = [];
      
      Object.entries(selectedDays).forEach(([dayKey, meals]: [string, any]) => {
        if (meals.breakfast) mealsToGenerate.push({ date: dayKey, mealType: 'breakfast' });
        if (meals.lunch) mealsToGenerate.push({ date: dayKey, mealType: 'lunch' });
        if (meals.dinner) mealsToGenerate.push({ date: dayKey, mealType: 'dinner' });
      });
      
      if (mealsToGenerate.length === 0) {
        toast.error("Please select at least one meal to plan");
        return;
      }
      
      const batchSize = 5;
      let successCount = 0;
      
      for (let i = 0; i < mealsToGenerate.length; i += batchSize) {
        const batch = mealsToGenerate.slice(i, i + batchSize);
        
        for (const meal of batch) {
          try {
            const result = await suggestMealForPlan({
              mealType: meal.mealType,
              additionalPreferences: `For the meal on ${format(new Date(meal.date), 'EEEE, MMMM d')}`
            });
            
            if (result && typeof result === 'object' && result.options && Array.isArray(result.options) && result.options.length > 0) {
              const suggestion = result.options[0];
              
              const newRecipe = await createRecipe({
                title: suggestion.title,
                description: suggestion.description || '',
                ingredients: suggestion.ingredients || [],
                instructions: suggestion.instructions || [],
                time: suggestion.time || null,
                servings: suggestion.servings || null,
                image: null,
                difficulty: null,
                tags: [],
                images: [],
                rating: null
              });
              
              await createMealPlan({
                date: new Date(meal.date),
                meal_type: meal.mealType,
                recipe_id: newRecipe.id,
              });
              
              successCount++;
            }
          } catch (error) {
            console.error(`Error generating meal for ${meal.date} ${meal.mealType}:`, error);
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully planned ${successCount} meals for your week!`);
        setPlanWeekOpen(false);
      } else {
        toast.error("Failed to generate meal plan. Please try again.");
      }
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      toast.error("Failed to generate meal plan. Please try again.");
    } finally {
      setGeneratingPlan(false);
    }
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
        <div className="mb-6">
          <Button 
            variant="lettuce" 
            onClick={() => setPlanWeekOpen(true)}
            className="w-full md:w-auto font-medium"
          >
            <CalendarDays className="h-5 w-5 mr-2" />
            Plan My Week For Me
          </Button>
        </div>
        
        <WeekView 
          weekDays={weekDays}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          onSuggestMeal={openSuggestMealDialog}
          onQuickAddMeal={handleQuickAddMeal}
          onChangeWeek={handleChangeWeek}
        />
        
        <ShoppingList />
      </div>
      
      <AddMealDialog 
        open={addMealOpen}
        onOpenChange={setAddMealOpen}
        currentDay={currentDay}
        currentMealType={currentMealType}
        recipes={recipes}
        onSelectRecipe={handleSelectRecipe}
      />

      <QuickAddMealDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        currentDay={currentDay}
        currentMealType={currentMealType}
        onSave={handleSaveQuickMeal}
      />

      <AiSuggestionsDialog 
        open={aiSuggestionsOpen}
        onOpenChange={setAiSuggestionsOpen}
        onGetSuggestions={handleGetAiSuggestions}
        aiLoading={aiLoading}
        suggestions={suggestions}
      />

      <SuggestMealDialog 
        open={suggestMealOpen}
        onOpenChange={setSuggestMealOpen}
        currentDay={currentDay}
        currentMealType={currentMealType}
        suggestMealType={suggestMealType}
        setSuggestMealType={setSuggestMealType}
        aiLoading={aiLoading}
        suggestedMeal={suggestedMeal}
        parsingMealSuggestion={parsingMealSuggestion}
        additionalPreferences={additionalPreferences}
        setAdditionalPreferences={setAdditionalPreferences}
        onSuggestMeal={handleSuggestMeal}
        onSaveSuggestedRecipe={handleSaveSuggestedRecipe}
        onResetSuggestedMeal={() => setSuggestedMeal(null)}
      />
      
      <PlanWeekDialog
        open={planWeekOpen}
        onOpenChange={setPlanWeekOpen}
        weekStart={weekStart}
        onGeneratePlan={handleGenerateWeeklyPlan}
        isGenerating={generatingPlan}
      />
    </MainLayout>
  );
};

export default MealPlan;
