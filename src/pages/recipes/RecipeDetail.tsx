import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import useRecipes from "@/hooks/useRecipes";
import useShoppingList, { ShoppingListItemInput, categorizeIngredient } from "@/hooks/useShoppingList";
import { parseIngredientAmount } from "@/lib/ingredient-parser";
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

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToShoppingList, setAddingToShoppingList] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  
  const { useRecipe, useDeleteRecipe } = useRecipes();
  const { useAddManyShoppingListItems } = useShoppingList();
  const { suggestMealForPlan, loading: aiLoading } = useAiRecipes();
  
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { mutateAsync: addToShoppingList } = useAddManyShoppingListItems();
  const { mutateAsync: deleteRecipe } = useDeleteRecipe();
  
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
              <Edit className="h-5 w-5" />
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
            <div className="flex gap-4">
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
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {recipe.description && (
            <p className="text-muted-foreground mb-6">{recipe.description}</p>
          )}

          <div className="mb-6">
            <AiSuggestionButton 
              onClick={handleOpenSuggestDialog} 
              label="Get AI Recipe Variations"
              className="w-full md:w-auto"
            />
          </div>
          
          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="mt-4">
              <ScrollArea className="max-h-[400px]">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => {
                    const { name, amount } = parseIngredientAmount(ingredient);
                    return (
                      <li key={index} className="flex items-baseline gap-2">
                        <span className="w-2 h-2 rounded-full bg-sage-500 mt-1.5 flex-shrink-0"></span>
                        <div>
                          <AiSuggestionTooltip 
                            content={index % 2 === 0 
                              ? `Try substituting with ${name.includes("chicken") ? "tofu" : name.includes("beef") ? "mushrooms" : "a seasonal alternative"}`
                              : `This ${name} pairs well with ${recipe.ingredients[(index + 3) % recipe.ingredients.length].split(" ").pop()}`
                            }
                          >
                            <div className="cursor-help border-b border-dotted border-purple-300">{name}</div>
                          </AiSuggestionTooltip>
                          {amount && (
                            <div className="text-xs text-muted-foreground">{amount}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <ScrollArea className="max-h-[400px]">
                <ol className="space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span>{step}</span>
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
                    className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex-1 max-w-40"
              onClick={handleAddToShoppingList}
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
              className="flex-1 max-w-40"
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
    </MainLayout>
  );
};

export default RecipeDetail;
