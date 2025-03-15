
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import useAiRecipes from '@/hooks/useAiRecipes';
import { useFridge } from '@/hooks/useFridge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { Sprout, Baby, Clock, Heart, Save, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [useFridge, setUseFridge] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<BabyFoodRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Record<string, boolean>>({});

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
        toast.success('Generated baby food recipes!');
      } else {
        toast.error('Failed to generate recipes. Please try again.');
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
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
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
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
              checked={useFridge}
              onCheckedChange={setUseFridge}
            />
            <Label htmlFor="use-fridge">Use ingredients from my fridge</Label>
          </div>

          {useFridge && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {isFridgeLoading ? (
                  <div className="w-full text-center py-3">Loading ingredients...</div>
                ) : availableIngredients.length > 0 ? (
                  availableIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5"
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
                  className="flex-1"
                />
                <Button type="submit" size="sm">Add</Button>
              </form>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2">Recipe preferences (optional)</h3>
          <Textarea
            placeholder="Add any specific preferences or requirements for the recipe..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="h-24"
          />
          <p className="text-xs text-muted-foreground mt-1">E.g., "Finger foods for baby-led weaning", "Purees for 6-month old", etc.</p>
        </div>

        <AiSuggestionButton
          onClick={handleGenerateRecipe}
          label="Generate Baby Food Recipes"
          isLoading={aiLoading}
          className="w-full"
        />
      </div>

      {generatedRecipes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase">Generated Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedRecipes.map((recipe, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="flex justify-between items-start">
                    <span>{recipe.title}</span>
                    <Badge variant="outline" className="ml-2 whitespace-nowrap">
                      {recipe.ageRange}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
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
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border px-6 py-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => saveRecipe(recipe)}
                    disabled={savedRecipes[recipe.title]}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savedRecipes[recipe.title] ? 'Saved' : 'Save Recipe'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BabyFoodGenerator;
