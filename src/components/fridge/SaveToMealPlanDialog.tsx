
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MealType } from "@/hooks/useMealPlans";
import RecipeGrid, { GridRecipe } from "@/components/recipes/RecipeGrid";
import { Loader2 } from "lucide-react";

interface SaveToMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMealType: MealType;
  onMealTypeChange: (type: MealType) => void;
  onSave: () => void;
  recipes: GridRecipe[];
  suggestedRecipe: GridRecipe | null;
  selectedRecipeId: string | null;
  onSelectRecipe: (recipeId: string) => void;
  loading: boolean;
}

const SaveToMealPlanDialog = ({
  open,
  onOpenChange,
  selectedMealType,
  onMealTypeChange,
  onSave,
  recipes,
  suggestedRecipe,
  selectedRecipeId,
  onSelectRecipe,
  loading
}: SaveToMealPlanDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to Meal Plan</DialogTitle>
          <DialogDescription>
            Choose a meal type and select a recipe to add to your meal plan
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              {["breakfast", "lunch", "dinner"].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-secondary/10 flex-1">
                  <input
                    type="radio"
                    value={type}
                    checked={selectedMealType === type}
                    onChange={() => onMealTypeChange(type as MealType)}
                    className="text-primary"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-grow mb-4 pr-4 -mr-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading recipes...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {suggestedRecipe && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recommended Recipe</h3>
                  <div className="max-w-xs mx-auto">
                    <RecipeGrid 
                      recipes={[{
                        ...suggestedRecipe,
                        selected: selectedRecipeId === suggestedRecipe.id,
                        onSelect: () => onSelectRecipe(suggestedRecipe.id)
                      }]} 
                      selectionMode={true}
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">Your Recipe Collection</h3>
                <RecipeGrid 
                  recipes={recipes.map(recipe => ({
                    ...recipe,
                    selected: selectedRecipeId === recipe.id,
                    onSelect: () => onSelectRecipe(recipe.id)
                  }))} 
                  selectionMode={true}
                  emptyMessage="No recipes in your collection"
                />
              </div>
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={!selectedRecipeId || loading}
          >
            Add to Today's Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToMealPlanDialog;
