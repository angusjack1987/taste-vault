
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import useAiRecipes from '@/hooks/useAiRecipes';
import { useFridge } from '@/hooks/useFridge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { Sprout, Baby, Clock, Heart, Save, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BabyFoodGeneratorProps {
  babyAge: string;
  babyNames: string[];
  babyFoodPreferences: string;
}

interface BabyFoodRecipe {
  title: string;
  description: string;
  ageRange: string;
  highlights: string[];
  ingredients: string[];
  instructions: string[];
  time: number;
  storageTips: string;
  nutritionalBenefits: string[];
}

const BabyFoodGenerator: React.FC<BabyFoodGeneratorProps> = ({ babyAge, babyNames, babyFoodPreferences }) => {
  const { user } = useAuth();
  const { loading: aiLoading, generateBabyFood } = useAiRecipes();
  const { useFridgeItems } = useFridge();
  const { data: fridgeItems, isLoading: isFridgeLoading } = useFridgeItems();
  
  const [shouldUseFridge, setShouldUseFridge] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<BabyFoodRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Record<string, boolean>>({});
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (fridgeItems && fridgeItems.length > 0) {
      const ingredients = fridgeItems.map(item => item.name);
      setAvailableIngredients(ingredients);
    }
  }, [fridgeItems]);

  const handleIngredientToggle = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleIngredientAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById('custom-ingredient') as HTMLInputElement;
    const ingredient = input.value.trim();
    
    if (ingredient && !availableIngredients.includes(ingredient)) {
      setAvailableIngredients([...availableIngredients, ingredient]);
      setSelectedIngredients([...selectedIngredients, ingredient]);
      input.value = '';
    }
  };

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Please select at least one ingredient');
      return;
    }

    setIsGeneratingModalOpen(true);
    
    try {
      const ingredients = [...selectedIngredients];
      const babyFoodPrefs = {
        babyAge: babyAge,
        babyFoodPreferences: babyFoodPreferences,
      };

      const recipes = await generateBabyFood({
        ingredients,
        babyFoodPreferences: babyFoodPrefs
      });

      if (recipes && recipes.length > 0) {
        setGeneratedRecipes(recipes);
        setIsGeneratingModalOpen(false);
        setIsRecipeModalOpen(true);
        toast.success('Generated baby food recipes!');
      } else {
        setIsGeneratingModalOpen(false);
        toast.error('Failed to generate recipes. Please try again.');
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      setIsGeneratingModalOpen(false);
      toast.error('Error generating recipes. Please try again.');
    }
  };

  const saveRecipe = async (recipe: BabyFoodRecipe) => {
    if (!user) {
      toast.error('You must be logged in to save recipes');
      return;
    }

    try {
      const { data, error } = await supabase.from('baby_food_recipes').insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        age_range: recipe.ageRange,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        preparation_time: recipe.time,
        storage_tips: recipe.storageTips,
        nutritional_benefits: recipe.nutritionalBenefits
      }).select('id').single();

      if (error) throw error;

      toast.success('Recipe saved successfully!');
      setSavedRecipes({ ...savedRecipes, [recipe.title]: true });
      setIsRecipeModalOpen(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  const handleSaveCurrentRecipe = () => {
    if (selectedRecipeIndex !== null && generatedRecipes[selectedRecipeIndex]) {
      saveRecipe(generatedRecipes[selectedRecipeIndex]);
    }
  };

  const renderRecipeCard = (recipe: BabyFoodRecipe, index: number) => {
    const isSelected = selectedRecipeIndex === index;
    
    return (
      <Card 
        key={index} 
        className={`mb-6 overflow-hidden border-4 border-black transition-all duration-300 ${
          isSelected 
            ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-50' 
            : 'shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
        }`}
        onClick={() => setSelectedRecipeIndex(index)}
      >
        <div className="p-4 bg-primary/10 border-b-4 border-black">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-black">{recipe.title}</h3>
            <Badge variant="outline" className="whitespace-nowrap border-2 border-black">
              {recipe.ageRange}
            </Badge>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm">{recipe.description}</p>
          
          <div className="flex items-center text-sm space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{recipe.time} mins</span>
            </div>
            <div className="flex items-center space-x-1">
              <Baby className="h-4 w-4 text-muted-foreground" />
              <span>{recipe.ageRange}</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Ingredients:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Instructions:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>
          
          {recipe.nutritionalBenefits && recipe.nutritionalBenefits.length > 0 && (
            <div>
              <h4 className="font-bold mb-2">Nutritional Benefits:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {recipe.nutritionalBenefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm">{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recipe.storageTips && (
            <div>
              <h4 className="font-bold mb-2">Storage Tips:</h4>
              <p className="text-sm">{recipe.storageTips}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6">
          <h2 className="text-xl font-black uppercase">AI Baby Food Recipe Generator</h2>
          <p className="text-muted-foreground">Create delicious, nutritious, and age-appropriate baby food recipes</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="use-fridge"
              checked={shouldUseFridge}
              onCheckedChange={setShouldUseFridge}
              className="border-2 border-black data-[state=checked]:bg-primary"
            />
            <Label htmlFor="use-fridge">Use ingredients from my fridge</Label>
          </div>

          {shouldUseFridge && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {isFridgeLoading ? (
                  <div className="w-full text-center py-3">Loading ingredients...</div>
                ) : availableIngredients.length > 0 ? (
                  availableIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      onClick={() => handleIngredientToggle(ingredient)}
                    >
                      {ingredient}
                    </Badge>
                  ))
                ) : (
                  <div className="w-full text-center py-3">No ingredients found in your fridge</div>
                )}
              </div>

              <form onSubmit={handleIngredientAdd} className="flex gap-2">
                <Input
                  id="custom-ingredient"
                  placeholder="Add a custom ingredient"
                  className="flex-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  Add
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">Recipe preferences (optional)</h3>
          <Input
            placeholder="Add any specific preferences or requirements for the recipe..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          />
          <p className="text-xs text-muted-foreground mt-1">E.g., "Finger foods for baby-led weaning", "Purees for 6-month old", etc.</p>
        </div>

        <AiSuggestionButton
          onClick={handleGenerateRecipe}
          label="Generate Baby Food Recipes"
          isLoading={aiLoading}
          className="w-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        />
      </div>

      {/* Generating Modal */}
      <Dialog open={isGeneratingModalOpen} onOpenChange={setIsGeneratingModalOpen}>
        <DialogContent className="max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="py-8 flex flex-col items-center">
            <div className="animate-spin mb-4 border-4 border-primary border-t-transparent rounded-full h-12 w-12"></div>
            <h3 className="text-lg font-black uppercase mb-2">Creating Recipes</h3>
            <p className="text-muted-foreground text-center">
              Generating delicious baby food recipes with {selectedIngredients.join(', ')}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Results Modal */}
      <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">
              <div className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5" />
                Baby Food Recipes
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] -mr-6 pr-6">
            <div className="space-y-4 p-2">
              {generatedRecipes.length > 0 ? (
                generatedRecipes.map((recipe, index) => renderRecipeCard(recipe, index))
              ) : (
                <div className="text-center py-6">No recipes generated yet</div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button
              onClick={() => setIsRecipeModalOpen(false)}
              variant="outline"
              className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Close
            </Button>
            <Button
              onClick={handleSaveCurrentRecipe}
              disabled={selectedRecipeIndex === null}
              className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BabyFoodGenerator;
