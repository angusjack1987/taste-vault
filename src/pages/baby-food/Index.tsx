import React, { useState, useEffect } from "react";
import { Baby, Leaf, Heart } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import { toast } from "sonner";
import useFridge from "@/hooks/useFridge";
import useAiRecipes from "@/hooks/useAiRecipes";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans, { MealType } from "@/hooks/useMealPlans";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import RecipeOptionsDialog from "@/components/fridge/RecipeOptionsDialog";
import SaveToMealPlanDialog from "@/components/fridge/SaveToMealPlanDialog";

const BabyFoodPage = () => {
  const { user } = useAuth();
  const { useFridgeItems } = useFridge();
  const { data: fridgeItems, isLoading } = useFridgeItems();
  
  const [babyFoodPreferences, setBabyFoodPreferences] = useState<{
    babyAge?: string;
    babyFoodPreferences?: string;
    ingredientsToAvoid?: string;
  }>({});
  
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  
  const { generateBabyFood } = useAiRecipes();
  const { useCreateRecipe } = useRecipes();
  const { useCreateMealPlan } = useMealPlans();
  
  const createRecipe = useCreateRecipe();
  const createMealPlan = useCreateMealPlan();
  
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.preferences && 
            typeof data.preferences === 'object' && 
            !Array.isArray(data.preferences)) {
          const userPrefs = data.preferences as any;
          if (userPrefs.food) {
            setBabyFoodPreferences({
              babyAge: userPrefs.food.babyAge,
              babyFoodPreferences: userPrefs.food.babyFoodPreferences,
              ingredientsToAvoid: userPrefs.food.ingredientsToAvoid
            });
          }
        }
      } catch (error) {
        console.error("Error fetching baby food preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  const generateBabyFoodRecipe = async () => {
    if (!fridgeItems || fridgeItems.length === 0) {
      toast.error("Add some ingredients to your fridge first");
      return;
    }

    try {
      setIsGeneratingRecipe(true);
      setRecipeDialogOpen(true);
      setGeneratedRecipes([]);
      setSelectedRecipeIndex(null);
      
      const availableIngredients = fridgeItems.map(item => item.name);
      
      const recipes = await generateBabyFood({
        ingredients: availableIngredients,
        babyFoodPreferences
      });
      
      setGeneratedRecipes(recipes || []);
      
      if (!recipes || recipes.length === 0) {
        toast.error("Couldn't generate baby food recipes with these ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error generating baby food recipes:", error);
      toast.error("Failed to generate recipes. Please try again.");
    } finally {
      setIsGeneratingRecipe(false);
    }
  };
  
  const handleSaveToRecipeBook = async () => {
    if (selectedRecipeIndex === null || !generatedRecipes[selectedRecipeIndex]) {
      toast.error("Please select a recipe first");
      return;
    }
    
    try {
      const selected = generatedRecipes[selectedRecipeIndex];
      
      await createRecipe.mutateAsync({
        title: selected.title,
        description: selected.description,
        ingredients: selected.ingredients || [],
        instructions: selected.instructions || [],
        time: selected.time || null,
        servings: selected.servings || null,
        image: null,
        images: [],
        difficulty: null,
        tags: [...(selected.highlights || []), "baby-food", `age-${selected.ageRange}`]
      });
      
      toast.success("Baby food recipe saved to your recipe book!");
      setRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    }
  };
  
  const handleAddToMealPlan = () => {
    if (selectedRecipeIndex === null) {
      toast.error("Please select a recipe first");
      return;
    }
    
    setSavePlanDialogOpen(true);
  };
  
  const handleSaveToMealPlan = async () => {
    if (selectedRecipeIndex === null || !generatedRecipes[selectedRecipeIndex]) {
      toast.error("Please select a recipe first");
      return;
    }
    
    try {
      const selected = generatedRecipes[selectedRecipeIndex];
      
      const savedRecipe = await createRecipe.mutateAsync({
        title: selected.title,
        description: selected.description,
        ingredients: selected.ingredients || [],
        instructions: selected.instructions || [],
        time: selected.time || null,
        servings: selected.servings || null,
        image: null,
        images: [],
        difficulty: null,
        tags: [...(selected.highlights || []), "baby-food", `age-${selected.ageRange}`]
      });
      
      const today = new Date();
      
      await createMealPlan.mutateAsync({
        date: today,
        meal_type: selectedMealType,
        recipe_id: savedRecipe.id
      });
      
      toast.success(`Recipe added to your meal plan for ${format(today, "EEEE")} (${selectedMealType})`);
      setSavePlanDialogOpen(false);
      setRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error saving to meal plan:", error);
      toast.error("Failed to add to meal plan. Please try again.");
    }
  };
  
  if (!babyFoodPreferences.babyAge) {
    return (
      <MainLayout title="Baby Food">
        <div className="page-container">
          <Card className="p-6 text-center space-y-4">
            <Baby className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Baby Food Preferences Required</h2>
            <p className="text-muted-foreground">
              Please set up your baby food preferences in the settings first.
            </p>
            <Button 
              variant="default" 
              onClick={() => window.location.href = "/settings/food-preferences"}
              className="mt-4"
            >
              Go to Settings
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Baby Food">
      <div className="page-container max-w-2xl mx-auto px-4 pb-20">
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Baby className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Baby Food Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                Age: {babyFoodPreferences.babyAge} months
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Leaf className="w-4 h-4" />
              <span>Using ingredients from your fridge for fresh baby food</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>Customized for your baby's preferences and dietary needs</span>
            </div>
          </div>
          
          <div className="mt-6">
            <AiSuggestionButton
              onClick={generateBabyFoodRecipe}
              label="Generate Baby Food Recipe"
              className="w-full"
              isLoading={isGeneratingRecipe}
              variant="berry"
            />
          </div>
        </Card>
        
        <RecipeOptionsDialog 
          open={recipeDialogOpen}
          onOpenChange={setRecipeDialogOpen}
          isGeneratingRecipe={isGeneratingRecipe}
          generatedRecipes={generatedRecipes}
          selectedRecipeIndex={selectedRecipeIndex}
          onSelectRecipe={setSelectedRecipeIndex}
          onSaveToRecipeBook={handleSaveToRecipeBook}
          onAddToMealPlan={handleAddToMealPlan}
        />
        
        <SaveToMealPlanDialog 
          open={savePlanDialogOpen}
          onOpenChange={setSavePlanDialogOpen}
          selectedMealType={selectedMealType}
          onMealTypeChange={setSelectedMealType}
          onSave={handleSaveToMealPlan}
        />
      </div>
    </MainLayout>
  );
};

export default BabyFoodPage;
