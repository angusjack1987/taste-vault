
import { useState, useEffect } from "react";
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
  Wand2,
  // Add missing food-related icons
  Beef,
  Fish,
  Apple,
  Egg,
  Wheat,
  Carrot,
  Utensils
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
import RecipeVariationsDialog from "@/components/recipes/RecipeVariationsDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import ShareRecipeDialog from "@/components/recipes/ShareRecipeDialog";
import SelectIngredientsDialog from "@/components/recipes/SelectIngredientsDialog";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToShoppingList, setAddingToShoppingList] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [variationsDialogOpen, setVariationsDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [selectIngredientsDialogOpen, setSelectIngredientsDialogOpen] = useState(false);
  
  const { useRecipe, useDeleteRecipe } = useRecipes();
  const { useAddManyShoppingListItems } = useShoppingList();
  const { suggestMealForPlan, loading: aiLoading } = useAiRecipes();
  
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { mutateAsync: addToShoppingList } = useAddManyShoppingListItems();
  const { mutateAsync: deleteRecipe } = useDeleteRecipe();

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

  const handleAddToShoppingList = async (selectedIngredients: string[] = []) => {
    if (!recipe) return;
    
    setAddingToShoppingList(true);
    
    try {
      const ingredientsToAdd = selectedIngredients.length > 0 ? selectedIngredients : recipe.ingredients;
      
      const shoppingItems: ShoppingListItemInput[] = ingredientsToAdd.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient,
        category: categorizeIngredient(ingredient),
        is_checked: false,
        quantity: null,
      }));
      
      await addToShoppingList(shoppingItems);
      toast.success(`${ingredientsToAdd.length} items added to shopping list`);
      setSelectIngredientsDialogOpen(false);
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

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
  };

  const handleOpenSelectIngredientsDialog = () => {
    setSelectIngredientsDialogOpen(true);
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

  const handleShareRecipe = (method: string) => {
    if (!recipe) return;
    
    const recipeUrl = window.location.href;
    const recipeTitle = recipe.title;
    const recipeDescription = recipe.description || "Check out this recipe!";
    
    switch (method) {
      case "copy":
        navigator.clipboard.writeText(recipeUrl).then(() => {
          toast.success("Link copied to clipboard");
          setShareDialogOpen(false);
        });
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(`${recipeDescription}\n\n${recipeUrl}`)}`;
        setShareDialogOpen(false);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${recipeTitle}\n${recipeDescription}\n\n${recipeUrl}`)}`, "_blank");
        setShareDialogOpen(false);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${recipeTitle}\n${recipeDescription}`)}&url=${encodeURIComponent(recipeUrl)}`, "_blank");
        setShareDialogOpen(false);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, "_blank");
        setShareDialogOpen(false);
        break;
      default:
        break;
    }
  };

  const getPastelColorForTag = (tag: string): string => {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('breakfast')) return 'bg-[#FEF7CD] text-black';
    if (tagLower.includes('lunch')) return 'bg-[#D3E4FD] text-black';
    if (tagLower.includes('dinner')) return 'bg-[#E5DEFF] text-black';
    if (tagLower.includes('dessert')) return 'bg-[#FFDEE2] text-black';
    if (tagLower.includes('snack')) return 'bg-[#FDE1D3] text-black';
    
    if (tagLower.includes('italian')) return 'bg-[#F2FCE2] text-black';
    if (tagLower.includes('mexican')) return 'bg-[#FEC6A1] text-black';
    if (tagLower.includes('asian') || tagLower.includes('chinese') || tagLower.includes('japanese')) return 'bg-[#F2FCE2] text-black';
    if (tagLower.includes('american')) return 'bg-[#FEF7CD] text-black';
    
    const colors = [
      'bg-[#F2FCE2] text-black',
      'bg-[#FEF7CD] text-black',
      'bg-[#FEC6A1] text-black',
      'bg-[#E5DEFF] text-black',
      'bg-[#FFDEE2] text-black',
      'bg-[#FDE1D3] text-black',
      'bg-[#D3E4FD] text-black',
    ];
    
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

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
  
  return (
    <MainLayout 
      title={recipe.title} 
      showBackButton={true}
      action={
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a href={`/recipes/${id}/edit`}>
              <Edit className="h-5 w-5 text-primary" />
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this recipe? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteRecipe}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div>
        <div className="relative">
          {recipe.image ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-48 md:h-64 object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h1 className="text-white text-xl font-semibold">{recipe.title}</h1>
          </div>
        </div>
        
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-4">
              {recipe.time && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{recipe.time} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{recipe.servings} servings</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="flex items-center text-muted-foreground">
                  <ChefHat className="w-4 h-4 mr-1" />
                  <span className="text-sm">{recipe.difficulty}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "icon"}
                onClick={() => setIsFavorited(!isFavorited)}
                className={isMobile ? "p-1" : ""}
              >
                <Heart 
                  className={`h-5 w-5 text-primary ${isFavorited ? 'fill-primary' : ''}`} 
                />
              </Button>
              <Button 
                variant="ghost"
                size={isMobile ? "sm" : "icon"}
                className={isMobile ? "p-1" : ""}
              >
                <Bookmark className="h-5 w-5 text-primary" />
              </Button>
              <Button 
                variant="ghost"
                size={isMobile ? "sm" : "icon"}
                onClick={handleOpenShareDialog}
                className={isMobile ? "p-1" : ""}
              >
                <Share2 className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
          
          {recipe.description && (
            <p className="text-muted-foreground mb-6">{recipe.description}</p>
          )}

          <div className="mb-6">
            <AiSuggestionButton
              onClick={handleOpenVariationsDialog}
              label="Create Variations"
              variant="cheese"
              isLoading={parsingMealSuggestion}
              className="w-full md:w-auto"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Create Variations
            </AiSuggestionButton>
          </div>
          
          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="mt-4">
              <ScrollArea maxHeight="350px">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => {
                    const cleanedIngredient = cleanIngredientString(ingredient);
                    const prepInstructions = extractPreparationInstructions(cleanedIngredient);
                    const { mainText, preparation } = parsePreparation(cleanedIngredient);
                    const { name, amount } = parseIngredientAmount(mainText);
                    
                    return (
                      <li key={index} className="flex items-center p-2 bg-sage-50 rounded-md border border-sage-200 hover:bg-sage-100 transition-colors">
                        <div className="flex-shrink-0 mr-3">
                          {getIngredientIcon(name)}
                        </div>
                        
                        <div className="flex-1">
                          <span className="text-sm">
                            {amount ? `${amount} ${name}` : name}
                            {(prepInstructions || preparation) && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {prepInstructions || preparation}
                              </span>
                            )}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <ScrollArea maxHeight="350px">
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 mb-4">
                      <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span className="text-xs sm:text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className={`px-3 py-1 rounded-full text-sm border-2 border-black font-medium ${getPastelColorForTag(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleOpenSelectIngredientsDialog}
              disabled={addingToShoppingList}
            >
              {addingToShoppingList ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4 mr-2" />
              )}
              Add to Shopping List
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate("/meal-plan")}
            >
              Add to Meal Plan
            </Button>
          </div>
        </div>
      </div>

      <SuggestMealDialog
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        currentDay={null}
        currentMealType={null}
        suggestMealType={suggestMealType}
        setSuggestMealType={setSuggestMealType}
        aiLoading={aiLoading}
        suggestedMeal={suggestedMeal}
        parsingMealSuggestion={parsingMealSuggestion}
        additionalPreferences={additionalPreferences}
        setAdditionalPreferences={setAdditionalPreferences}
        onSuggestMeal={handleSuggestMeal}
        onSaveSuggestedRecipe={handleSaveSuggestedRecipe}
        onResetSuggestedMeal={handleResetSuggestedMeal}
      />

      <RecipeVariationsDialog
        open={variationsDialogOpen}
        onOpenChange={setVariationsDialogOpen}
        recipeName={recipe.title}
        onGenerateVariation={handleGenerateVariation}
        isLoading={parsingMealSuggestion}
      />

      <ShareRecipeDialog 
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        recipeName={recipe.title}
        onShare={handleShareRecipe}
      />

      <SelectIngredientsDialog
        open={selectIngredientsDialogOpen}
        onOpenChange={setSelectIngredientsDialogOpen}
        ingredients={recipe?.ingredients || []}
        onConfirm={handleAddToShoppingList}
        isLoading={addingToShoppingList}
      />
    </MainLayout>
  );
};

export default RecipeDetail;
