
import { useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Share2, ShoppingBag, ChefHat, Plus, Copy, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecipes } from '@/hooks/useRecipes';
import useShoppingList, { ShoppingListItemInput, categorizeIngredient } from '@/hooks/useShoppingList';
import { Recipe } from '@/hooks/recipes/types';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SelectIngredientsDialog from '@/components/recipes/SelectIngredientsDialog';
import ShareRecipeDialog from '@/components/recipes/ShareRecipeDialog';
import RecipeVariationsDialog from '@/components/recipes/RecipeVariationsDialog';
import useAiRecipes from '@/hooks/useAiRecipes';
import { getIngredientIcon, getPastelColorForTag } from '@/utils/recipe-icons';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { useRecipe, useDeleteRecipe } = useRecipes();
  const { useAddManyShoppingListItems } = useShoppingList();
  const { suggestMealForPlan } = useAiRecipes();
  
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { mutateAsync: deleteRecipe } = useDeleteRecipe();
  const { mutateAsync: addToShoppingList } = useAddManyShoppingListItems();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [addingToShoppingList, setAddingToShoppingList] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [selectIngredientsDialogOpen, setSelectIngredientsDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [variationsDialogOpen, setVariationsDialogOpen] = useState(false);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [suggestMealType, setSuggestMealType] = useState("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);

  useEffect(() => {
    if (recipe?.user_id) {
      const fetchCreator = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('username, first_name')
          .eq('id', recipe.user_id)
          .single();
        if (data) {
          setCreatorProfile(data);
        }
      };
      fetchCreator();
    }
  }, [recipe?.user_id]);

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
        quantity: null
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
        setSuggestedMeal({
          rawResponse: result
        });
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
        setSuggestedMeal({
          rawResponse: result
        });
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

  const formatRawResponse = (rawResponse: unknown): string => {
    if (rawResponse === null || rawResponse === undefined) {
      return 'No response data available';
    }
    
    if (typeof rawResponse === 'string') {
      return rawResponse;
    }
    
    if (typeof rawResponse === 'object') {
      try {
        return JSON.stringify(rawResponse, null, 2);
      } catch (e) {
        return 'Error formatting response data';
      }
    }
    
    return String(rawResponse);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Recipe not found</h1>
          <p className="text-gray-500">The recipe you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button variant="default" asChild>
            <Link to="/recipes">Back to Recipes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-20">
      <div className="space-y-6">
        <div className="relative w-full">
          {recipe.image ? (
            <div className="w-full h-64 overflow-hidden rounded-lg">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Utensils className="text-gray-400 h-16 w-16" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-gray-600">{recipe.description}</p>
            )}
            
            {creatorProfile && (
              <div className="flex items-center gap-2 mt-1">
                <div className="text-sm text-gray-500">Created by:</div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{creatorProfile.username?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {creatorProfile.first_name || creatorProfile.username || "Unknown user"}
                </span>
              </div>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index} className={`${getPastelColorForTag(tag)} border-none`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {recipe.time && (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{recipe.time} min</p>
                </CardContent>
              </Card>
            )}
            {recipe.servings && (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-gray-500">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </CardContent>
              </Card>
            )}
            {recipe.difficulty && (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <p className="font-semibold capitalize">{recipe.difficulty}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenSelectIngredientsDialog} disabled={addingToShoppingList}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Shopping List
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenVariationsDialog}>
              <ChefHat className="h-4 w-4 mr-2" />
              Variations
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenShareDialog}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/recipes/${recipe.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Recipe</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this recipe? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteRecipe}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Recipe"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            {recipe.notes && <TabsTrigger value="notes">Notes</TabsTrigger>}
            {recipe.nutrients && <TabsTrigger value="nutrients">Nutrition</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="ingredients" className="space-y-4">
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  {getIngredientIcon(ingredient)}
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <ol className="space-y-3 list-decimal list-inside">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="pl-1">
                  {instruction}
                </li>
              ))}
            </ol>
          </TabsContent>
          
          {recipe.notes && (
            <TabsContent value="notes" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-line">{recipe.notes}</p>
              </div>
            </TabsContent>
          )}
          
          {recipe.nutrients && (
            <TabsContent value="nutrients" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {recipe.nutrients.calories !== undefined && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-500">Calories</p>
                      <p className="font-semibold">{recipe.nutrients.calories} kcal</p>
                    </CardContent>
                  </Card>
                )}
                {recipe.nutrients.protein !== undefined && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-500">Protein</p>
                      <p className="font-semibold">{recipe.nutrients.protein} g</p>
                    </CardContent>
                  </Card>
                )}
                {recipe.nutrients.carbs !== undefined && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-500">Carbs</p>
                      <p className="font-semibold">{recipe.nutrients.carbs} g</p>
                    </CardContent>
                  </Card>
                )}
                {recipe.nutrients.fat !== undefined && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-500">Fat</p>
                      <p className="font-semibold">{recipe.nutrients.fat} g</p>
                    </CardContent>
                  </Card>
                )}
                {Object.entries(recipe.nutrients)
                  .filter(([key]) => !['calories', 'protein', 'carbs', 'fat'].includes(key))
                  .map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-3">
                        <p className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                        <p className="font-semibold">{value} g</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <SelectIngredientsDialog
        open={selectIngredientsDialogOpen}
        onOpenChange={setSelectIngredientsDialogOpen}
        ingredients={recipe.ingredients}
        onConfirm={handleAddToShoppingList}
        isLoading={addingToShoppingList}
      />

      <ShareRecipeDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        recipeName={recipe.title}
        onShare={handleShareRecipe}
      />

      <RecipeVariationsDialog
        open={variationsDialogOpen}
        onOpenChange={setVariationsDialogOpen}
        recipeName={recipe.title}
        onGenerateVariation={handleGenerateVariation}
        isLoading={parsingMealSuggestion}
      />

      <Dialog open={suggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Recipe Suggestion</DialogTitle>
          </DialogHeader>
          
          {suggestedMeal ? (
            <div className="space-y-4 py-2">
              {suggestedMeal.title ? (
                <>
                  <h3 className="text-xl font-semibold">{suggestedMeal.title}</h3>
                  {suggestedMeal.description && (
                    <p className="text-gray-700">{suggestedMeal.description}</p>
                  )}
                  
                  {suggestedMeal.ingredients && suggestedMeal.ingredients.length > 0 && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="ingredients">
                        <AccordionTrigger>Ingredients</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            {suggestedMeal.ingredients.map((ingredient: string, i: number) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  {suggestedMeal.instructions && suggestedMeal.instructions.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="instructions">
                        <AccordionTrigger>Instructions</AccordionTrigger>
                        <AccordionContent>
                          <ol className="list-decimal pl-5 space-y-2">
                            {suggestedMeal.instructions.map((instruction: string, i: number) => (
                              <li key={i}>{instruction}</li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-line">
                  {/* Fix: Convert the unknown type to a string before rendering */}
                  {formatRawResponse(suggestedMeal.rawResponse)}
                </div>
              )}
              
              <div className="flex flex-wrap justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleResetSuggestedMeal}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveSuggestedRecipe(0)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Save to My Recipes
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-gray-500">Generating suggestion...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeDetail;
