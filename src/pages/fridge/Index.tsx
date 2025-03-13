
import React, { useState, useRef, useEffect } from "react";
import { Mic, Plus, Trash2, X, Star, Utensils, AudioWaveform, Loader2, BookmarkPlus, Calendar } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useFridge, { FridgeItem } from "@/hooks/useFridge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import useAiRecipes from "@/hooks/useAiRecipes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import useRecipes from "@/hooks/useRecipes";
import useMealPlans, { MealType } from "@/hooks/useMealPlans";
import { format, addDays } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const FridgePage = () => {
  const {
    useFridgeItems,
    addItem,
    deleteItem,
    toggleAlwaysAvailable,
    clearNonAlwaysAvailableItems,
    isVoiceRecording,
    startVoiceRecording,
    stopVoiceRecording,
    isProcessingVoice,
    audioLevel,
    batchAddItems,
  } = useFridge();
  
  const { data: fridgeItems, isLoading, refetch } = useFridgeItems();
  const [newItemName, setNewItemName] = useState("");
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const { generateRecipe, loading: recipeLoading } = useAiRecipes();
  const { useCreateRecipe } = useRecipes();
  const { useCreateMealPlan } = useMealPlans();
  
  const createRecipe = useCreateRecipe();
  const createMealPlan = useCreateMealPlan();
  
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  
  // Effect to animate processing progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessingVoice) {
      setProcessingProgress(0);
      
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          // Slow down progress as it approaches 90%
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 1;
          const nextProgress = Math.min(prev + increment, 90);
          return nextProgress;
        });
      }, 300);
    } else {
      // When processing is done, fill to 100%
      setProcessingProgress(isProcessingVoice ? 0 : 100);
      
      // Reset to 0 after completion animation
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
        title: "Recipe from fridge ingredients",
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
        difficulty: null,
        tags: selected.highlights || []
      });
      
      toast.success("Recipe saved to your recipe book!");
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
      // First save the recipe
      const selected = generatedRecipes[selectedRecipeIndex];
      
      const savedRecipe = await createRecipe.mutateAsync({
        title: selected.title,
        description: selected.description,
        ingredients: selected.ingredients || [],
        instructions: selected.instructions || [],
        time: selected.time || null,
        servings: selected.servings || null,
        image: null,
        difficulty: null,
        tags: selected.highlights || []
      });
      
      // Then add to meal plan for today
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

  // Add "Always Available" to the categories
  const categories = ["All", "Always Available", "Fridge", "Pantry", "Freezer"];

  // Filtering logic for the "Always Available" tab
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
  
  return (
    <MainLayout title="My Fridge" showBackButton>
      <div className="page-container max-w-2xl mx-auto px-4 pb-20">
        <Tabs defaultValue="All" className="w-full">
          <div className="sticky top-[73px] z-10 bg-background pt-4 pb-2">
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
              <div className="space-y-6">
                {category !== "Always Available" && (
                  <form onSubmit={handleAddItem} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Add item to your fridge..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full rounded-full"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!newItemName.trim()}
                      className="rounded-full bg-primary text-primary-foreground h-10 w-10"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handleVoiceButton}
                      variant={isVoiceRecording ? "destructive" : "outline"}
                      size="icon"
                      className="relative rounded-full h-10 w-10"
                      disabled={isProcessingVoice && !isVoiceRecording}
                    >
                      {isVoiceRecording ? (
                        <AudioWaveform className="h-5 w-5 animate-pulse" />
                      ) : isProcessingVoice ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                      {isVoiceRecording && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </Button>
                  </form>
                )}
                
                {isVoiceRecording && (
                  <div className="bg-secondary/20 p-4 rounded-xl text-center relative overflow-hidden">
                    <p className="mb-2 text-sm">Recording... Speak clearly to add items</p>
                    
                    {/* Voice amplitude visualization */}
                    <div className="flex items-center justify-center h-12 mb-2">
                      {Array.from({ length: 9 }).map((_, i) => {
                        // Calculate animation delay and height based on position
                        const delay = `${i * 50}ms`;
                        const height = audioLevel > 0 
                          ? Math.min(100, 30 + (audioLevel * 70 * Math.sin((i + 1) * 0.7))) 
                          : 30 + (30 * Math.sin((i + 1) * 0.7));
                          
                        return (
                          <div 
                            key={i} 
                            className="mx-0.5 w-1 bg-primary rounded-full animate-sound-wave"
                            style={{ 
                              height: `${height}%`, 
                              animationDelay: delay,
                              transform: `scaleY(${audioLevel > 0 ? (0.5 + audioLevel * 0.5) : 0.5})`
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={stopVoiceRecording}
                      className="gap-1 rounded-full"
                    >
                      <X className="h-4 w-4" /> Stop Recording
                    </Button>
                  </div>
                )}

                {isProcessingVoice && !isVoiceRecording && (
                  <div className="bg-secondary/20 p-4 rounded-xl text-center animate-fade-in">
                    <p className="mb-2 text-sm">Processing your voice input...</p>
                    <div className="my-4">
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Identifying food items</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center mt-4">
                  <AiSuggestionButton
                    onClick={generateRecipeFromFridge}
                    label="Generate Recipe from Fridge"
                    className="w-full max-w-sm"
                    isLoading={isGeneratingRecipe}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                      {category === "All" ? "All Items" : `${category} Items`}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {getFilteredItems(category).length || 0} items
                      </span>
                      
                      {category !== "Always Available" && fridgeItems && fridgeItems.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleClearAllItems}
                          className="gap-1 text-destructive hover:text-destructive rounded-full"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Clear Non-Saved</span>
                          <span className="inline sm:hidden">Clear</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading items...</div>
                  ) : getFilteredItems(category).length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      {category === "Always Available" 
                        ? "No saved items yet. Mark items as 'Always Available'."
                        : "No items added yet. Add items using the form above."}
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-360px)]">
                      <div className="space-y-2 pr-4">
                        {getFilteredItems(category).map((item) => (
                          <FridgeItemCard 
                            key={item.id} 
                            item={item} 
                            onDelete={() => deleteItem.mutate(item.id)}
                            onToggleAlwaysAvailable={(always_available) => 
                              toggleAlwaysAvailable.mutate({ id: item.id, always_available })
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Recipe Options Dialog */}
        <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Recipes from Your Fridge</DialogTitle>
              <DialogDescription>
                Choose from recipe options based on ingredients in your fridge
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-grow overflow-auto pr-4 mt-4">
              {isGeneratingRecipe ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <div className="text-lg font-medium">Creating delicious recipes</div>
                  <div className="text-muted-foreground">Analyzing your ingredients...</div>
                </div>
              ) : generatedRecipes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recipes could be generated. Please try again.
                </div>
              ) : generatedRecipes[0]?.rawContent ? (
                <div className="whitespace-pre-line p-4">
                  {generatedRecipes[0].rawContent}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground text-center mb-2">
                    Select one recipe to save or add to your meal plan
                  </div>
                  
                  {generatedRecipes.map((recipe, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedRecipeIndex(index)}
                      className={cn(
                        "border rounded-xl p-4 cursor-pointer transition-all",
                        selectedRecipeIndex === index 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "hover:border-muted-foreground"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{recipe.title}</h3>
                        <div className={cn(
                          "rounded-full border w-6 h-6 flex items-center justify-center",
                          selectedRecipeIndex === index ? "border-primary text-primary" : "border-muted-foreground"
                        )}>
                          {selectedRecipeIndex === index 
                            ? <CheckCircle2 className="h-5 w-5" /> 
                            : <Circle className="h-5 w-5" />
                          }
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{recipe.description}</p>
                      
                      {recipe.highlights && recipe.highlights.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {recipe.highlights.map((highlight: string, hidx: number) => (
                              <div key={hidx} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center">
                                <Star className="h-3 w-3 mr-1 text-amber-500" />
                                {highlight}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">Ingredients:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {recipe.ingredients?.map((ingredient: string, idx: number) => (
                              <li key={idx}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1">Instructions:</h4>
                          <ol className="list-decimal pl-5 space-y-2">
                            {recipe.instructions?.map((step: string, idx: number) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-2 text-muted-foreground">
                          {recipe.time && (
                            <div>⏱️ {recipe.time} min</div>
                          )}
                          {recipe.servings && (
                            <div>👥 Serves {recipe.servings}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {!isGeneratingRecipe && generatedRecipes.length > 0 && !generatedRecipes[0]?.rawContent && (
              <DialogFooter className="flex flex-row gap-2 justify-end pt-4 border-t mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setRecipeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveToRecipeBook}
                  disabled={selectedRecipeIndex === null}
                  className="gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save to Recipe Book
                </Button>
                <Button
                  onClick={handleAddToMealPlan}
                  disabled={selectedRecipeIndex === null}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add to Meal Plan
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Add to Meal Plan Dialog */}
        <Dialog open={savePlanDialogOpen} onOpenChange={setSavePlanDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add to Meal Plan</DialogTitle>
              <DialogDescription>
                Choose which meal to add this recipe to
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meal Type</label>
                <div className="flex flex-col space-y-2">
                  {["breakfast", "lunch", "dinner"].map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-secondary/10">
                      <input
                        type="radio"
                        value={type}
                        checked={selectedMealType === type}
                        onChange={() => setSelectedMealType(type as MealType)}
                        className="text-primary"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSavePlanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveToMealPlan}>
                Add to Today's Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

const FridgeItemCard = ({ 
  item, 
  onDelete,
  onToggleAlwaysAvailable
}: { 
  item: FridgeItem; 
  onDelete: () => void;
  onToggleAlwaysAvailable: (always_available: boolean) => void;
}) => {
  // Track if toggle is in progress to prevent double-clicks
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggleAlwaysAvailable = (checked: boolean) => {
    // Prevent multiple rapid toggles
    if (isToggling) return;
    
    setIsToggling(true);
    
    console.log(`Toggle always available for ${item.name} to: ${checked}`);
    
    // Call the parent handler with the new value
    onToggleAlwaysAvailable(checked);
    
    // Reset the toggling state after a short delay
    setTimeout(() => setIsToggling(false), 500);
  };
  
  return (
    <Card className={`overflow-hidden border-border rounded-xl hover:shadow-sm transition-all ${item.always_available ? 'border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10' : ''}`}>
      <CardContent className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-bold">{item.name}</p>
              {item.always_available && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            {item.quantity && (
              <p className="text-sm text-muted-foreground">{item.quantity}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch 
              checked={!!item.always_available}
              onCheckedChange={handleToggleAlwaysAvailable}
              id={`always-available-${item.id}`}
              disabled={isToggling}
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">Always</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="rounded-full h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FridgePage;
