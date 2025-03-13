
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/hooks/useRecipes';
import { MealType } from '@/hooks/useMealPlans';

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
  recipes, 
  onSelectRecipe 
}: AddMealDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Select Recipe for {currentMealType ? currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1) : ''} 
            {currentDay ? ` - ${format(currentDay, 'MMM d, yyyy')}` : ''}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {recipes && recipes.length > 0 ? (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <div 
                  key={recipe.id}
                  className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onSelectRecipe(recipe.id)}
                >
                  {recipe.image ? (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-16 h-16 rounded-md object-cover" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{recipe.title}</h3>
                    {recipe.time && (
                      <p className="text-sm text-muted-foreground">{recipe.time} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't created any recipes yet.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                asChild
              >
                <a href="/recipes/new">Create Recipe</a>
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealDialog;
