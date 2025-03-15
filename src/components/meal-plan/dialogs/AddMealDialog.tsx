
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { MealType } from '@/hooks/useMealPlans';
import { Recipe } from '@/hooks/recipes/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import RecipeGrid, { GridRecipe } from '@/components/recipes/RecipeGrid';
import { useAuth } from '@/hooks/useAuth';
import { useRandomRecipeByMealType } from '@/hooks/recipes/queries';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: Date | null;
  currentMealType: MealType | null;
  recipes: Recipe[] | undefined;
  onSelectRecipe: (recipeId: string) => void;
}

const AddMealDialog = ({
  open,
  onOpenChange,
  currentDay,
  currentMealType,
  recipes = [],
  onSelectRecipe
}: AddMealDialogProps) => {
  const [searchText, setSearchText] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch a recommended recipe based on meal type
  const { data: recommendedRecipe, isLoading: isLoadingRecommended } = 
    useRandomRecipeByMealType(currentMealType || 'dinner', user);
  
  // Reset selected recipe when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedRecipeId(null);
      setSearchText('');
    }
  }, [open]);
  
  // Get curated list of recipes
  const allRecipes: Recipe[] = recipes || [];
  const filteredRecipes = searchText
    ? allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchText.toLowerCase())
      )
    : allRecipes;
  
  // Convert to grid format
  const gridRecipes: GridRecipe[] = filteredRecipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || '',
    time: recipe.time || undefined,
    rating: recipe.rating || undefined,
    selected: recipe.id === selectedRecipeId,
    onSelect: () => setSelectedRecipeId(recipe.id)
  }));
  
  // Create recommended recipe grid item if available
  const recommendedGridRecipe = recommendedRecipe ? {
    id: recommendedRecipe.id,
    title: recommendedRecipe.title,
    image: recommendedRecipe.image || '',
    time: recommendedRecipe.time || undefined,
    rating: recommendedRecipe.rating || undefined,
    selected: recommendedRecipe.id === selectedRecipeId,
    onSelect: () => setSelectedRecipeId(recommendedRecipe.id)
  } : null;
  
  const handleSave = () => {
    if (selectedRecipeId) {
      onSelectRecipe(selectedRecipeId);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentDay && (
              <span>
                Add Meal for {format(currentDay, 'EEEE, MMMM d')}
                {currentMealType && <span className="ml-1">({currentMealType})</span>}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-grow mb-4 pr-4 -mr-4">
          <div className="space-y-6">
            {/* Recommended recipe section */}
            {isLoadingRecommended ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading recommendation...</span>
              </div>
            ) : recommendedGridRecipe ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Recommended for {currentMealType}</h3>
                <div className="max-w-xs mx-auto">
                  <RecipeGrid 
                    recipes={[recommendedGridRecipe]} 
                    selectionMode={true}
                  />
                </div>
              </div>
            ) : null}
            
            {/* All recipes section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {searchText ? 'Search Results' : 'Your Recipes'}
              </h3>
              <RecipeGrid 
                recipes={gridRecipes} 
                selectionMode={true}
                emptyMessage={searchText ? "No recipes match your search" : "No recipes in your collection"}
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedRecipeId}
          >
            Add to Meal Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealDialog;
