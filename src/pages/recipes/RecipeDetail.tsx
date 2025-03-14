import { useState } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Bookmark, 
  Heart, 
  Share2, 
  Edit,
  Loader2,
  ShoppingBag,
  Check,
  Trash2,
  Sparkles,
  Utensils,
  Carrot,
  Beef,
  Fish,
  Apple,
  Egg,
  Wheat,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import useRecipes from "@/hooks/useRecipes";
import useShoppingList, { ShoppingListItemInput, categorizeIngredient } from "@/hooks/useShoppingList";
import { parseIngredientAmount, parsePreparation, cleanIngredientString, extractPreparationInstructions } from "@/lib/ingredient-parser";
import { toast } from "sonner";
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
import SuggestMealDialog from "@/components/meal-plan/dialogs/SuggestMealDialog";
import useAiRecipes from "@/hooks/useAiRecipes";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";
import RecipeVariationsDialog from "@/components/recipes/RecipeVariationsDialog";
import InstructionsWithTooltips from "@/components/recipes/InstructionsWithTooltips";

interface EnhancedInstruction {
  step: string;
  tooltips: Array<{
    text: string;
    ingredient: string;
    explanation?: string;
  }>;
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToShoppingList, setAddingToShoppingList] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [variationsDialogOpen, setVariationsDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [enhancedInstructions, setEnhancedInstructions] = useState<EnhancedInstruction[]>([]);
  const [isEnhancingInstructions, setIsEnhancingInstructions] = useState(false);
  const [isInstructionsEnhanced, setIsInstructionsEnhanced] = useState(false);
  const [isSavingEnhancedInstructions, setIsSavingEnhancedInstructions] = useState(false);
  
  const { useRecipe, useUpdateRecipe } = useRecipes();
  const { useAddManyShoppingListItems } = useShoppingList();
  const { suggestMealForPlan, enhanceRecipeInstructions, loading: aiLoading } = useAiRecipes();
  
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { mutateAsync: addToShoppingList } = useAddManyShoppingListItems();
  const { mutateAsync: updateRecipe } = useUpdateRecipe();
  const { mutateAsync: deleteRecipe } = useRecipes().useDeleteRecipe();
  
  const getIngredientIcon = (ingredientName: string) => {
    const lowerName = ingredientName.toLowerCase();
    
    if (/chicken|turkey|beef|meat|steak|pork|lamb|veal/i.test(lowerName)) {
      return <Beef className="h-4 w-4 text-sage-500" />;
    } else if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|seafood/i.test(lowerName)) {
      return <Fish className="h-4 w-4 text-sage-500" />;
    } else if (/apple|banana|orange|grape|berry|berries|fruit|pear|peach|plum|mango|pineapple|watermelon|melon|kiwi|cherry|cherries|strawberry|blueberry|raspberry|blackberry|blackberries|cherry|cherries/i.test(lowerName)) {
      return <Apple className="h-4 w-4 text-sage-500" />;
    } else if (/egg|eggs/i.test(lowerName)) {
      return <Egg className="h-4 w-4 text-sage-500" />;
    } else if (/flour|bread|rice|pasta|grain|wheat|cereal|oat/i.test(lowerName)) {
      return <Wheat className="h-4 w-4 text-sage-500" />;
    } else if (/carrot|vegetable|tomato|potato|onion|garlic|pepper|cucumber|lettuce/i.test(lowerName)) {
      return <Carrot className="h-4 w-4 text-sage-500" />;
    } else {
      return <Utensils className="h-4 w-4 text-sage-500" />;
    }
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) return;
    
    setAddingToShoppingList(true);
    
    try {
      const shoppingItems: ShoppingListItemInput[] = recipe.ingredients.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient,
        category: categorizeIngredient(ingredient),
        is_checked: false,
        quantity: null,
      }));
      
      await addToShoppingList(shoppingItems);
      toast.success("Added to shopping list");
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      toast.error("Failed to add to shopping list");
    } finally {
      setAddingToShoppingList(false);
    }
  };
  
  const handleDeleteRecipe = async () => {
    if (!recipe || !id) return;
    
    setIsDeleting(true);
    
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted successfully");
      navigate("/recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenSuggestDialog = () => {
    setSuggestDialogOpen(true);
  };
  
  const handleOpenVariationsDialog = () => {
    setVariationsDialogOpen(true);
  };

  const handleGenerateVariation = async (type: string, preferences?: string) => {
    if (!recipe) return;
    
    setParsingMealSuggestion(true);
    
    try {
      let promptPrefix = "";
      switch (type) {
        case "variation":
          promptPrefix = `Create a variation of "${recipe.title}" that maintains its essence but offers a new experience.`;
          break;
        case "remix":
          promptPrefix = `Reimagine "${recipe.title}" with creative twists, unexpected ingredients, or transformative techniques.`;
          break;
        case "substitution":
          promptPrefix = `Adapt "${recipe.title}" with ingredient substitutions${preferences ? ` for ${preferences}` : ""} while maintaining flavor and texture.`;
          break;
      }
      
      setAdditionalPreferences(promptPrefix);
      
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences: promptPrefix
      });
      
      try {
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
        setVariationsDialogOpen(false);
        setSuggestDialogOpen(true);
      } catch (e) {
        setSuggestedMeal({ rawResponse: result });
        setVariationsDialogOpen(false);
        setSuggestDialogOpen(true);
      }
    } catch (error) {
      console.error("Error suggesting variations:", error);
      toast.error("Failed to generate variation");
      setSuggestedMeal(null);
    } finally {
      setParsingMealSuggestion(false);
    }
  };

  const handleSuggestMeal = async () => {
    if (!recipe) return;
    
    setParsingMealSuggestion(true);
    
    try {
      setAdditionalPreferences(`Similar to "${recipe.title}" but with variations`);
      
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences: `Similar to "${recipe.title}" but with variations`
      });
      
      try {
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
      } catch (e) {
        setSuggestedMeal({ rawResponse: result });
      }
    } catch (error) {
      console.error("Error suggesting meal:", error);
      toast.error("Failed to generate suggestions");
      setSuggestedMeal(null);
    } finally {
      setParsingMealSuggestion(false);
    }
  };

  const handleSaveSuggestedRecipe = async (optionIndex: number) => {
    toast.success("Recipe variation saved to your collection");
    setSuggestDialogOpen(false);
    setSuggestedMeal(null);
  };

  const handleResetSuggestedMeal = () => {
    setSuggestedMeal(null);
  };

  const handleEnhanceInstructions = async () => {
    if (!recipe) return;
    
    setIsEnhancingInstructions(true);
    
    try {
      const result = await enhanceRecipeInstructions({
        recipeTitle: recipe.title,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients
      });
      
      if (result && Array.isArray(result)) {
        setEnhancedInstructions(result);
        setIsInstructionsEnhanced(true);
        toast.success("Instructions enhanced with detailed tooltips");
      } else {
        throw new Error("Couldn't enhance instructions");
      }
    } catch (error) {
      console.error("Error enhancing instructions:", error);
      toast.error("Failed to enhance instructions");
    } finally {
      setIsEnhancingInstructions(false);
    }
  };

  const handleSaveEnhancedInstructions = async () => {
    if (!recipe || !id || !isInstructionsEnhanced || enhancedInstructions.length === 0) return;
    
    setIsSavingEnhancedInstructions(true);
    
    try {
      const updatedInstructions = enhancedInstructions.map(enhanced => {
        return enhanced.step;
      });
      
      const enhancedInstructionsMetadata = enhancedInstructions.map(enhanced => ({
        step: enhanced.step,
        tooltips: enhanced.tooltips,
      }));
      
      await updateRecipe({
        id,
        ...recipe,
        instructions: updatedInstructions,
        description: recipe.description + "\n\n<!-- ENHANCED_INSTRUCTIONS:" + 
          JSON.stringify(enhancedInstructionsMetadata) + " -->"
      });
      
      toast.success("Enhanced instructions saved to recipe");
    } catch (error) {
      console.error("Error saving enhanced instructions:", error);
      toast.error("Failed to save enhanced instructions");
    } finally {
      setIsSavingEnhancedInstructions(false);
    }
  };

  const extractEnhancedInstructionsFromMetadata = () => {
    if (!recipe || !recipe.description) return null;
    
    const match = recipe.description.match(/<!-- ENHANCED_INSTRUCTIONS:(.*?) -->/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]) as EnhancedInstruction[];
      } catch (e) {
        console.error("Failed to parse enhanced instructions from metadata", e);
        return null;
      }
    }
    return null;
  };

  React.useEffect(() => {
    if (recipe && !isInstructionsEnhanced) {
      const savedEnhancedInstructions = extractEnhancedInstructionsFromMetadata();
      if (savedEnhancedInstructions) {
        setEnhancedInstructions(savedEnhancedInstructions);
        setIsInstructionsEnhanced(true);
      }
    }
  }, [recipe, isInstructionsEnhanced]);

  if (isLoading) {
    return (
      <MainLayout title="Loading Recipe..." showBackButton={true}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  if (error || !recipe) {
    toast.error("Failed to load recipe");
    return (
      <MainLayout title="Recipe Not Found" showBackButton={true}>
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-muted-foreground mb-4">
            The recipe you're looking for couldn't be found.
          </p>
          <Button onClick={() => navigate("/recipes")}>
            Return to Recipes
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const displayDescription = recipe?.description ? 
    recipe.description.replace(/<!-- ENHANCED_INSTRUCTIONS:.*? -->/, '') : 
    null;

  return (
    <MainLayout 
      title={recipe.title} 
      showBackButton={true}
      action={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFavorited(!isFavorited)}
            className={isFavorited ? "text-red-500" : ""}
          >
            <Heart className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/recipes/edit/${id}`)}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="page-container space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{recipe.cooking_time || "30 min"}</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{recipe.servings || "4"} servings</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChefHat className="h-4 w-4" />
                <span className="text-sm">{recipe.difficulty || "Medium"}</span>
              </div>
            </div>
            
            {displayDescription && (
              <p className="text-muted-foreground whitespace-pre-line">
                {displayDescription}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.tags && recipe.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/3 space-y-3 flex flex-col">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={handleAddToShoppingList}
              disabled={addingToShoppingList}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              <span>{addingToShoppingList ? "Adding..." : "Add to Shopping List"}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={handleOpenVariationsDialog}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              <span>Generate Variations</span>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  <span>{isDeleting ? "Deleting..." : "Delete Recipe"}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this recipe and remove it from any meal plans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRecipe}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="py-4">
            <ScrollArea className="max-h-[400px]">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {getIngredientIcon(ingredient)}
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="instructions" className="py-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Preparation Steps</h3>
              <div className="flex items-center gap-2">
                {isInstructionsEnhanced ? (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleSaveEnhancedInstructions}
                    disabled={isSavingEnhancedInstructions || !isInstructionsEnhanced}
                  >
                    {isSavingEnhancedInstructions ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Enhanced
                  </Button>
                ) : (
                  <AiSuggestionButton
                    onClick={handleEnhanceInstructions}
                    loading={isEnhancingInstructions}
                    title="Enhance Instructions"
                    tooltip="Add helpful tooltips to instructions"
                    className="h-8 w-8"
                    iconSize={16}
                  />
                )}
              </div>
            </div>
            
            <ScrollArea className="max-h-[400px]">
              {isInstructionsEnhanced ? (
                <InstructionsWithTooltips 
                  instructions={enhancedInstructions} 
                />
              ) : (
                <ol className="list-decimal list-inside space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm">
                      {instruction}
                    </li>
                  ))}
                </ol>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      <SuggestMealDialog
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        suggestedMeal={suggestedMeal}
        loading={parsingMealSuggestion}
        onReset={handleResetSuggestedMeal}
        onSave={handleSaveSuggestedRecipe}
        additionalPreferences={additionalPreferences}
      />
      
      <RecipeVariationsDialog 
        open={variationsDialogOpen}
        onOpenChange={setVariationsDialogOpen}
        onGenerateVariation={handleGenerateVariation}
        isLoading={parsingMealSuggestion}
        recipeTitle={recipe.title}
      />
    </MainLayout>
  );
};

export default RecipeDetail;
