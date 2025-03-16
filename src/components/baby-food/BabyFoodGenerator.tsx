import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sprout, Baby, Clock, Heart, Save, ChefHat, ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { CleanNeoBrutalistAccordion } from '@/components/ui/clean-accordion';
import useAuth from '@/hooks/useAuth';
import useAiRecipes from '@/hooks/useAiRecipes';
import useFridge from '@/hooks/useFridge';

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
  const isMobile = useIsMobile();
  
  const [shouldUseFridge, setShouldUseFridge] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<BabyFoodRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

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

    setIsGenerating(true);
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
    } finally {
      setIsGenerating(false);
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

  const pastelColors = [
    "bg-[#F2FCE2] hover:bg-[#E2ECd2]", // Soft Green
    "bg-[#FEF7CD] hover:bg-[#EEE7Bd]", // Soft Yellow
    "bg-[#FEC6A1] hover:bg-[#EEB691]", // Soft Orange
    "bg-[#E5DEFF] hover:bg-[#D5CEEF]", // Soft Purple
    "bg-[#FFDEE2] hover:bg-[#EFCED2]", // Soft Pink
    "bg-[#FDE1D3] hover:bg-[#EDD1C3]", // Soft Peach
    "bg-[#D3E4FD] hover:bg-[#C3D4ED]", // Soft Blue
  ];

  const getRandomPastelColor = () => {
    const randomIndex = Math.floor(Math.random() * pastelColors.length);
    return pastelColors[randomIndex];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
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
              className="neo-switch"
            />
            <Label htmlFor="use-fridge" className="font-medium">Use ingredients from my fridge</Label>
          </div>

          {shouldUseFridge && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {isFridgeLoading ? (
                  <div className="w-full text-center py-3">Loading ingredients...</div>
                ) : availableIngredients.length > 0 ? (
                  availableIngredients.map((ingredient, index) => (
                    <Badge
                      key={ingredient}
                      variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                      className={`cursor-pointer text-sm py-1.5 border-2 border-black font-medium ${
                        selectedIngredients.includes(ingredient) 
                          ? "bg-black text-white" 
                          : `${getRandomPastelColor()} text-black`
                      }`}
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
                  className="flex-1 border-2 border-black"
                />
                <Button type="submit" size="sm" className="border-2 border-black bg-[#FEF7CD] text-black hover:bg-[#EEE7Bd]">Add</Button>
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
            className="w-full border-2 border-black"
          />
          <p className="text-xs text-muted-foreground mt-1">E.g., "Finger foods for baby-led weaning", "Purees for 6-month old", etc.</p>
        </div>

        <AiSuggestionButton
          onClick={handleGenerateRecipe}
          label="Generate Baby Food Recipes"
          action="Create"
          isLoading={aiLoading}
          className="w-full"
        />
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Creating baby-friendly recipes...</p>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}

      {generatedRecipes.length > 0 && !isGenerating && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase">Generated Recipes</h2>
          <div className="space-y-4">
            {generatedRecipes.map((recipe, index) => (
              <Card 
                key={index}
                className="border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300"
              >
                <CleanNeoBrutalistAccordion
                  value={`recipe-${index}`}
                  title={
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <span className="font-medium">{recipe.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`whitespace-nowrap ${getRandomPastelColor()} border-2 border-black`}
                        >
                          {recipe.ageRange}
                        </Badge>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{recipe.time} mins</span>
                        </div>
                      </div>
                    </div>
                  }
                  className="bg-white"
                >
                  <div className="space-y-4 pt-2">
                    <p className="text-sm">{recipe.description}</p>
                    
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

                    <Button
                      variant="outline"
                      className="w-full mt-4 border-2 border-black bg-white hover:bg-gray-50"
                      onClick={() => saveRecipe(recipe)}
                      disabled={savedRecipes[recipe.title]}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savedRecipes[recipe.title] ? 'Saved' : 'Save Recipe'}
                    </Button>
                  </div>
                </CleanNeoBrutalistAccordion>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BabyFoodGenerator;
