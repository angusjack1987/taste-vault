
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GridRecipe } from '@/components/recipes/RecipeGrid';
import RecipeCard from '@/components/recipes/RecipeCard';
import { Loader2, RefreshCw } from 'lucide-react';

export interface RecipeOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGeneratingRecipe: boolean;
  generatedRecipes: any[];
  selectedRecipeIndex: number;
  onSelectRecipe: React.Dispatch<React.SetStateAction<number>>;
  onSaveToRecipeBook: () => Promise<void>;
  onAddToMealPlan: (recipeId: string) => Promise<void>;
  recipes: GridRecipe[];
  onRegenerateRecipe: () => void;
  onRetrySingleOption?: (index: number) => void;
}

const RecipeOptionsDialog: React.FC<RecipeOptionsDialogProps> = ({
  open,
  onOpenChange,
  isGeneratingRecipe,
  generatedRecipes,
  selectedRecipeIndex,
  onSelectRecipe,
  onSaveToRecipeBook,
  onAddToMealPlan,
  recipes,
  onRegenerateRecipe,
  onRetrySingleOption
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Recipe Option</DialogTitle>
        </DialogHeader>
        
        {isGeneratingRecipe ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Generating recipe options...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">AI-generated options:</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRegenerateRecipe}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> 
                Generate New Options
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                {generatedRecipes.map((recipe, index) => (
                  <div 
                    key={index} 
                    className={`border-2 p-4 rounded-lg cursor-pointer ${
                      selectedRecipeIndex === index ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => onSelectRecipe(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold">{recipe.title}</h4>
                      
                      {onRetrySingleOption && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetrySingleOption(index);
                          }}
                          title="Regenerate this option"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>
                    
                    <div className="mt-2">
                      <h5 className="font-medium mb-1">Ingredients:</h5>
                      <ul className="text-sm pl-5 list-disc">
                        {recipe.ingredients.slice(0, 5).map((ing: string, i: number) => (
                          <li key={i}>{ing}</li>
                        ))}
                        {recipe.ingredients.length > 5 && <li>...and {recipe.ingredients.length - 5} more</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {recipes && recipes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Or choose from your recipe book:</h3>
                <ScrollArea className="h-56">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {recipes.map(recipe => (
                      <div 
                        key={recipe.id} 
                        className="cursor-pointer"
                        onClick={() => onAddToMealPlan(recipe.id)}
                      >
                        <RecipeCard {...recipe} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onSaveToRecipeBook}
            disabled={isGeneratingRecipe || generatedRecipes.length === 0}
          >
            Save Selected Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeOptionsDialog;
