import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingAnimation from '@/components/ui/loading-animation';

interface BabyFoodGeneratorProps {
  babyAge: string;
  babyNames: string[];
  babyFoodPreferences: string;
}

const BabyFoodGenerator: React.FC<BabyFoodGeneratorProps> = ({ 
  babyAge, 
  babyNames,
  babyFoodPreferences 
}) => {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipeHtml, setRecipeHtml] = useState<string | null>(null);
  
  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      toast.error('Please enter at least one ingredient');
      return;
    }
    
    setLoading(true);
    setRecipeHtml(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-baby-food', {
        body: {
          ingredients: ingredients.trim(),
          babyAge: babyAge,
          preferences: preferences.trim() || babyFoodPreferences,
          babyName: babyNames.length > 0 ? babyNames[0] : undefined
        }
      });
      
      if (error) throw error;
      
      // Clean the HTML if needed
      let cleanedHtml = data.recipe;
      cleanedHtml = cleanedHtml.replace(/```html/g, '');
      cleanedHtml = cleanedHtml.replace(/```/g, '');
      
      setRecipeHtml(cleanedHtml);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4">
          <h2 className="text-xl font-black uppercase">Baby Food Generator</h2>
          <p className="text-muted-foreground">Craft a personalized baby food recipe</p>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Enter ingredients (e.g., avocado, banana)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Textarea
            placeholder="Add any specific preferences (e.g., smooth texture, no citrus)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="resize-none"
          />
        </div>
        
        <div className="mt-6 flex space-x-2">
          <AiSuggestionButton
            onClick={handleGenerateRecipe}
            isLoading={loading}
            label="Generate Recipe"
          />
        </div>
      </div>
      
      {loading && (
        <Card className="overflow-hidden border-2 border-black">
          <CardHeader className="bg-secondary/20 pb-3">
            <CardTitle className="text-lg">Creating Baby Food Recipe</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LoadingAnimation text="Crafting a delicious baby recipe..." />
          </CardContent>
        </Card>
      )}
      
      {recipeHtml && !loading && (
        <Card className="overflow-hidden border-2 border-black">
          <CardHeader className="bg-secondary/20 pb-3">
            <CardTitle className="text-lg">
              Baby Recipe {babyNames.length > 0 && `for ${babyNames.join(' & ')}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: recipeHtml }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BabyFoodGenerator;
