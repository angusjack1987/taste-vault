import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

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
  const [nextRecipe, setNextRecipe] = useState<string | null>(null);
  const [prevRecipe, setPrevRecipe] = useState<string | null>(null);
  
  // Card animation states
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { useRecipe, useDeleteRecipe, useAllRecipes } = useRecipes();
  const { useAddManyShoppingListItems } = useShoppingList();
  const { suggestMealForPlan, enhanceRecipeInstructions, loading: aiLoading } = useAiRecipes();
  
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { data: allRecipes } = useAllRecipes();
  const { mutateAsync: addToShoppingList } = useAddManyShoppingListItems();
  const { mutateAsync: deleteRecipe } = useDeleteRecipe();

  useEffect(() => {
    if (allRecipes && allRecipes.length > 0 && id) {
      const currentIndex = allRecipes.findIndex(r => r.id === id);
      if (currentIndex > 0) {
        setPrevRecipe(allRecipes[currentIndex - 1].id);
      } else {
        setPrevRecipe(null);
      }
      
      if (currentIndex < allRecipes.length - 1) {
        setNextRecipe(allRecipes[currentIndex + 1].id);
      } else {
        setNextRecipe(null);
      }
    }
  }, [allRecipes, id]);

  // Reset card position when recipe changes
  useEffect(() => {
    setCurrentX(0);
    setIsDragging(false);
    setSwipeDirection(null);
  }, [id]);

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

  // Touch event handlers for card animation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    e.stopPropagation(); // Prevent parent container from handling this touch
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const deltaX = x - startX;
    setCurrentX(deltaX);
    
    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
    
    e.stopPropagation(); // Prevent parent container from handling this touch
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const threshold = 100;
    setIsDragging(false);
    
    if (currentX > threshold && prevRecipe) {
      // Swiped right
      navigate(`/recipes/${prevRecipe}`);
    } else if (currentX < -threshold && nextRecipe) {
      // Swiped left
      navigate(`/recipes/${nextRecipe}`);
    } else {
      // Reset position
      setCurrentX(0);
      setSwipeDirection(null);
    }
    
    e.stopPropagation(); // Prevent parent container from handling this touch
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setStartX(e.clientX);
    setIsDragging(true);
    e.stopPropagation(); // Prevent parent container from handling this mouse event
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setCurrentX(deltaX);
    
    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
    
    e.stopPropagation(); // Prevent parent container from handling this mouse event
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const threshold = 100;
    setIsDragging(false);
    
    if (currentX > threshold && prevRecipe) {
      // Swiped right
      navigate(`/recipes/${prevRecipe}`);
    } else if (currentX < -threshold && nextRecipe) {
      // Swiped left
      navigate(`/recipes/${nextRecipe}`);
    } else {
      // Reset position
      setCurrentX(0);
      setSwipeDirection(null);
    }
    
    e.stopPropagation(); // Prevent parent container from handling this mouse event
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      setCurrentX(0);
      setSwipeDirection(null);
      e.stopPropagation(); // Prevent parent container from handling this mouse event
    }
  };

  // Navigation function
  const handleNavigation = (direction: 'left' | 'right') => {
    if (direction === 'left' && nextRecipe) {
      navigate(`/recipes/${nextRecipe}`);
    } else if (direction === 'right' && prevRecipe) {
      navigate(`/recipes/${prevRecipe}`);
    }
  };

  // Calculate card style based on swipe
  const getCardStyle = () => {
    let transform = `translateX(${currentX}px)`;
    const rotate = currentX / 20; // add some rotation for a more natural feel
    transform += ` rotate(${rotate}deg)`;
    
    return {
      transform,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      opacity: isDragging ? (1 - Math.min(0.3, Math.abs(currentX) / 800)) : 1,
    };
  };

  // Get indicator style based on swipe direction
  const getIndicatorStyle = (direction: 'left' | 'right') => {
    if (swipeDirection === direction) {
      return 'opacity-100 scale-100';
    }
    return 'opacity-0 scale-75';
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
      disableSwipe={true}
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
      <div className="relative w-full h-full overflow-hidden">
        {/* Swipe indicators */}
        {prevRecipe && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 transition-all duration-200 ${getIndicatorStyle('right')}`}>
            <div className="bg-white rounded-full p-4 shadow-lg">
              <ChevronLeft className="h-8 w-8 text-black" />
            </div>
          </div>
        )}
        
        {nextRecipe && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 transition-all duration-200 ${getIndicatorStyle('left')}`}>
            <div className="bg-white rounded-full p-4 shadow-lg">
              <ChevronRight className="h-8 w-8 text-black" />
            </div>
          </div>
        )}
      
        {/* Recipe Card - THIS IS THE CARD THAT SHOULD SWIPE */}
        <div 
          ref={cardRef}
          className="group bg-white rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border-2 border-black touch-manipulation"
          style={getCardStyle()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="md:hidden text-xs text-center text-muted-foreground py-2">
            Swipe to navigate between recipes
          </div>
        
          <div className="relative">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-48 md:h-64 object-cover rounded-t-xl"
                draggable="false"
              />
            ) : (
              <div className="w-full h-48 md:h-64 bg-muted flex items-center justify-center rounded-t-xl">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
              <h1 className="text-white text-xl font-semibold">{recipe.title}</h1>
            </div>
          </div>
          
          <div className="page-container">
            <div className="hidden md:flex justify-between my-2">
              {prevRecipe ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/recipes/${prevRecipe}`)}
                  className="border-2 border-black hover:bg-yellow-300 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Recipe
                </Button>
              ) : (
                <div></div>
              )}
              
              {nextRecipe && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/recipes/${nextRecipe}`)}
                  className="border-2 border-black hover:bg-green-300 transition-colors"
                >
                  Next Recipe
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

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

            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <AiSuggestionButton 
                onClick={handleEnhanceInstructions} 
                label={isInstructionsEnhanced ? "Instructions Enhanced" : "Enhance Instructions"}
                variant="lettuce"
                isLoading={isEnhancingInstructions}
                className="w-full md:w-auto"
              >
                {isInstructionsEnhanced ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Instructions Enhanced
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Enhance Instructions
                  </>
                )}
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
                  {isEnhancingInstructions ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span>Enhancing instructions...</span>
                    </div>
                  ) : (
                    <InstructionsWithTooltips
                      instructions={recipe.instructions}
                      ingredients={recipe.ingredients}
                      enhancedInstructions={enhancedInstructions}
                      isEnhanced={isInstructionsEnhanced}
                    />
                  )}
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
            
            <div className="mt-8 flex gap-3 justify-center pb-6">
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
    </MainLayout>
  );
};

export default RecipeDetail;
