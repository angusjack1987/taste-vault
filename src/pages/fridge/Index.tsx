
import React, { useState, useRef, useEffect } from "react";
import { Mic, Plus, Trash2, X, Star, Utensils, AudioWaveform, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const [generatedRecipe, setGeneratedRecipe] = useState("");
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const { generateRecipe, loading: recipeLoading } = useAiRecipes();
  
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
      
      const availableIngredients = fridgeItems.map(item => item.name);
      
      const recipe = await generateRecipe({
        title: "Recipe from fridge ingredients",
        ingredients: availableIngredients
      });
      
      setGeneratedRecipe(recipe || "Sorry, couldn't generate a recipe with these ingredients.");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGeneratingRecipe(false);
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
        
        <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recipe from Your Fridge</DialogTitle>
              <DialogDescription>
                Here's a recipe based on ingredients in your fridge
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              {isGeneratingRecipe ? (
                <div className="py-8 text-center">
                  <div className="animate-pulse text-center">
                    Generating your recipe...
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-line">
                  {generatedRecipe}
                </div>
              )}
            </div>
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
