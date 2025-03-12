
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuggestRecipesParams {
  preferences?: string;
  dietaryRestrictions?: string;
}

interface AnalyzeMealPlanParams {
  mealPlan: any[];
}

interface GenerateRecipeParams {
  title: string;
  ingredients: string[];
}

export const useAiRecipes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestRecipes = async ({ preferences, dietaryRestrictions }: SuggestRecipesParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "suggest-recipes",
          data: { preferences, dietaryRestrictions },
        },
      });

      if (error) throw error;
      
      return data.result;
    } catch (err) {
      console.error("Error suggesting recipes:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get recipe suggestions";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeMealPlan = async ({ mealPlan }: AnalyzeMealPlanParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "analyze-meal-plan",
          data: { mealPlan },
        },
      });

      if (error) throw error;
      
      return data.result;
    } catch (err) {
      console.error("Error analyzing meal plan:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze meal plan";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const generateRecipe = async ({ title, ingredients }: GenerateRecipeParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "generate-recipe",
          data: { title, ingredients },
        },
      });

      if (error) throw error;
      
      return data.result;
    } catch (err) {
      console.error("Error generating recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate recipe";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestRecipes,
    analyzeMealPlan,
    generateRecipe,
    loading,
    error,
  };
};

export default useAiRecipes;
