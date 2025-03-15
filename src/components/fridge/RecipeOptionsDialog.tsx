
import React from "react";
import { Loader2, BookmarkPlus, Calendar, CheckCircle2, Circle, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface RecipeOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGeneratingRecipe: boolean;
  generatedRecipes: any[];
  selectedRecipeIndex: number | null;
  onSelectRecipe: (index: number) => void;
  onSaveToRecipeBook: () => void;
  onAddToMealPlan: () => void;
}

const RecipeOptionsDialog = ({
  open,
  onOpenChange,
  isGeneratingRecipe,
  generatedRecipes,
  selectedRecipeIndex,
  onSelectRecipe,
  onSaveToRecipeBook,
  onAddToMealPlan
}: RecipeOptionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Recipes from Your Fridge</DialogTitle>
          <DialogDescription>
            Choose from recipe options based on ingredients in your fridge
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-auto pr-4 mt-4">
          {isGeneratingRecipe ? (
            <div className="py-10 text-center relative">
              {/* Neo-brutalist animation elements - now with rounded circles */}
              <div className="absolute top-0 left-10 w-20 h-20 bg-yellow-300 border-4 border-black rounded-full animate-neo-float opacity-40"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-pink-400 border-4 border-black rounded-full animate-bounce opacity-30"></div>
              
              <div className="relative z-10 bg-white p-6 border-4 border-black rounded-xl shadow-neo-heavy animate-pulse">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <div className="text-lg font-black uppercase">Creating delicious recipes</div>
                <div className="text-muted-foreground font-bold">
                  Analyzing your ingredients...
                </div>
              </div>
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
                  onClick={() => onSelectRecipe(index)}
                  className={cn(
                    "border-4 border-black rounded-xl p-4 cursor-pointer transition-all hover:shadow-neo-hover hover:-translate-y-1",
                    selectedRecipeIndex === index 
                      ? "shadow-neo-heavy bg-primary/5" 
                      : "shadow-neo"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-black uppercase">{recipe.title}</h3>
                    <div className={cn(
                      "rounded-full border-2 border-black w-6 h-6 flex items-center justify-center bg-white",
                      selectedRecipeIndex === index ? "bg-primary text-primary-foreground" : ""
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
                          <div key={hidx} className="bg-yellow-200 text-black text-xs px-2 py-1 rounded-full border-2 border-black flex items-center shadow-neo-sm">
                            <Star className="h-3 w-3 mr-1 text-amber-500" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm space-y-4">
                    <div>
                      <h4 className="font-bold mb-1">Ingredients:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.ingredients?.map((ingredient: string, idx: number) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold mb-1">Instructions:</h4>
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSaveToRecipeBook}
              disabled={selectedRecipeIndex === null}
              className="gap-2"
              variant="bread"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save to Recipe Book
            </Button>
            <Button
              onClick={onAddToMealPlan}
              disabled={selectedRecipeIndex === null}
              className="gap-2"
              variant="cheese"
            >
              <Calendar className="h-4 w-4" />
              Add to Meal Plan
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeOptionsDialog;
