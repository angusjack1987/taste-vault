import React, { useState, useEffect } from "react";
import { Mic, Utensils, AudioWaveform } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import { toast } from "sonner";
import useFridge from "@/hooks/useFridge";
import useAiRecipes from "@/hooks/useAiRecipes";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans, { MealType } from "@/hooks/useMealPlans";
import { format } from "date-fns";

import FridgeAddItemForm from "@/components/fridge/FridgeAddItemForm";
import VoiceInputSection from "@/components/fridge/VoiceInputSection";
import FridgeItemsList from "@/components/fridge/FridgeItemsList";
import RecipeOptionsDialog from "@/components/fridge/RecipeOptionsDialog";
import SaveToMealPlanDialog from "@/components/fridge/SaveToMealPlanDialog";
import { GridRecipe } from "@/components/recipes/RecipeGrid";

const FridgePage = () => {
  const {
    useFridgeItems,
    addItem,
    deleteItem,
    toggleAlwaysAvailable,
    updateItem,
    clearNonAlwaysAvailableItems,
    isVoiceRecording,
    startVoiceRecording,
    stopVoiceRecording,
    isProcessingVoice,
    audioLevel,
  } = useFridge();
  
  const { data: fridgeItems, isLoading } = useFridgeItems();
  const [newItemName, setNewItemName] = useState("");
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const { generateRecipe, loading: aiLoading } = useAiRecipes();
  const { useCreateRecipe, useAllRecipes } = useRecipes();
  const { useCreateMealPlan } = useMealPlans();
  
  const createRecipe = useCreateRecipe();
  const createMealPlan = useCreateMealPlan();
  const { data: allRecipes = [] } = useAllRecipes();
  
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  const [selectedMealPlanRecipeId, setSelectedMealPlanRecipeId] = useState<string | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessingVoice) {
      setProcessingProgress(0);
      
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 1;
          const nextProgress = Math.min(prev + increment, 90);
          return nextProgress;
        });
      }, 300);
    } else {
      setProcessingProgress(isProcessingVoice ? 0 : 100);
      
      if (!isProcessingVoice && processingProgress === 100) {
        const timeout = setTimeout(() => {
          setProcessingProgress(0);
        }, 1000);
        
        return () => clearTimeout(timeout);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessingVoice]);
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addItem.mutate({ name: newItemName.trim() });
      setNewItemName("");
    }
  };

  const handleVoiceButton = () => {
    if (isVoiceRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleClearAllItems = () => {
    if (window.confirm("Are you sure you want to clear all non-saved items from your fridge?")) {
      clearNonAlwaysAvailableItems.mutate();
    }
  };

  const handleUpdateCategory = (id: string, category: string) => {
    if (!id || !category) return;
    
    updateItem.mutate({
      id,
      category
    });
  };

  const generateRecipeFromFridge = async () => {
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
      
      const recipes = await generateRecipe({
        ingredients: availableIngredients
      });
      
      setGeneratedRecipes(recipes || []);
      
      if (!recipes || recipes.length === 0) {
        toast.error("Couldn't generate recipes with these ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error generating recipes:", error);
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
        tags: selected.highlights || [],
        rating: null
      });
      
      toast.success("Recipe saved to your recipe book!");
      setRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    }
  };
  
  const handleAddToMealPlan = async (recipeId: string) => {
    // Store selected recipe ID
    setSelectedMealPlanRecipeId(null);
    setSavePlanDialogOpen(true);
  };
  
  const handleSaveToMealPlan = async () => {
    if (selectedRecipeIndex === null || !generatedRecipes[selectedRecipeIndex]) {
      toast.error("Please select a recipe first");
      return;
    }
    
    try {
      const selected = generatedRecipes[selectedRecipeIndex];
      
      // If no recipe is selected from the collection or the suggested one,
      // save the generated recipe
      let recipeId = selectedMealPlanRecipeId;
      
      if (!recipeId) {
        // Save the generated recipe to the recipe book first
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
          tags: selected.highlights || [],
          rating: null
        });
        
        recipeId = savedRecipe.id;
      }
      
      const today = new Date();
      
      await createMealPlan.mutateAsync({
        date: today,
        meal_type: selectedMealType,
        recipe_id: recipeId
      });
      
      toast.success(`Recipe added to your meal plan for ${format(today, "EEEE")} (${selectedMealType})`);
      setSavePlanDialogOpen(false);
      setRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error saving to meal plan:", error);
      toast.error("Failed to add to meal plan. Please try again.");
    }
  };

  const categories = ["All", "Always Available", "Fridge", "Pantry", "Freezer"];

  const getFilteredItems = (category: string) => {
    if (!fridgeItems) return [];
    
    if (category === "Always Available") {
      return fridgeItems.filter(item => item.always_available);
    }
    
    if (category === "All") {
      return fridgeItems;
    }
    
    return fridgeItems.filter(item => 
      (item.category || "Fridge") === category
    );
  };
  
  // Convert recipes to GridRecipe format for selection
  const gridRecipes: GridRecipe[] = allRecipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || '',
    time: recipe.time || undefined,
    rating: recipe.rating || undefined
  }));
  
  // Get a suggested recipe if we saved one from the generated recipes
  let suggestedRecipe: GridRecipe | null = null;
  if (selectedRecipeIndex !== null && generatedRecipes[selectedRecipeIndex]) {
    const recipe = generatedRecipes[selectedRecipeIndex];
    suggestedRecipe = {
      id: "generated-recipe",
      title: recipe.title,
      image: "", // Use a placeholder
      time: recipe.time
    };
  }
  
  return (
    <MainLayout title="My Fridge" showBackButton>
      <div className="page-container max-w-2xl mx-auto px-4 pb-20">
        <div className="mb-6 mt-4">
          <FridgeAddItemForm 
            newItemName={newItemName}
            onNewItemNameChange={setNewItemName}
            onAddItem={handleAddItem}
            isVoiceRecording={isVoiceRecording}
            isProcessingVoice={isProcessingVoice}
            onVoiceButtonClick={handleVoiceButton}
          />
          
          <VoiceInputSection 
            isVoiceRecording={isVoiceRecording}
            isProcessingVoice={isProcessingVoice}
            audioLevel={audioLevel}
            processingProgress={processingProgress}
            stopVoiceRecording={stopVoiceRecording}
          />
          
          <div className="flex justify-center mt-4">
            <AiSuggestionButton
              onClick={generateRecipeFromFridge}
              label="Generate Recipe from Fridge"
              className="w-full max-w-sm"
              isLoading={isGeneratingRecipe || aiLoading}
              variant="cheese"
            />
          </div>
        </div>
        
        <Tabs defaultValue="All" className="w-full">
          <div className="sticky top-[73px] z-10 bg-background pt-2 pb-2">
            <TabsList className="w-full rounded-full bg-muted">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="flex-1 rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary"
                >
                  {category === "Always Available" ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Always</span>
                    </div>
                  ) : (
                    category
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <FridgeItemsList 
                category={category}
                filteredItems={getFilteredItems(category)}
                isLoading={isLoading}
                onDeleteItem={(id) => deleteItem.mutate(id)}
                onToggleAlwaysAvailable={(id, value) => toggleAlwaysAvailable.mutate({ id, always_available: value })}
                onUpdateCategory={handleUpdateCategory}
                onClearNonSavedItems={handleClearAllItems}
              />
            </TabsContent>
          ))}
        </Tabs>
        
        <RecipeOptionsDialog 
          open={recipeDialogOpen}
          onOpenChange={setRecipeDialogOpen}
          isGeneratingRecipe={isGeneratingRecipe || aiLoading}
          generatedRecipes={generatedRecipes}
          selectedRecipeIndex={selectedRecipeIndex}
          onSelectRecipe={setSelectedRecipeIndex}
          onSaveToRecipeBook={handleSaveToRecipeBook}
          onAddToMealPlan={handleAddToMealPlan}
          recipes={gridRecipes}
        />
        
        <SaveToMealPlanDialog 
          open={savePlanDialogOpen}
          onOpenChange={setSavePlanDialogOpen}
          selectedMealType={selectedMealType}
          onMealTypeChange={setSelectedMealType}
          onSave={handleSaveToMealPlan}
          recipes={gridRecipes}
          suggestedRecipe={suggestedRecipe}
          selectedRecipeId={selectedMealPlanRecipeId}
          onSelectRecipe={setSelectedMealPlanRecipeId}
          loading={false}
        />
      </div>
    </MainLayout>
  );
};

export default FridgePage;
