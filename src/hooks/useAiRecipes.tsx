
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

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

interface UserFoodPreferences {
  favoriteCuisines?: string;
  favoriteChefs?: string;
  ingredientsToAvoid?: string;
  dietaryNotes?: string;
}

export const useAiRecipes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getUserFoodPreferences = async (): Promise<UserFoodPreferences | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      // Make sure we safely access the food preferences object
      if (data?.preferences && typeof data.preferences === 'object') {
        return data.preferences.food as UserFoodPreferences || null;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching food preferences:", err);
      return null;
    }
  };

  const suggestRecipes = async ({ preferences, dietaryRestrictions }: SuggestRecipesParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user's food preferences from the database
      const userFoodPreferences = await getUserFoodPreferences();
      
      // Combine explicit preferences with stored user preferences
      const combinedData = {
        preferences,
        dietaryRestrictions,
        userFoodPreferences
      };
      
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "suggest-recipes",
          data: combinedData,
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
      // Get user's food preferences from the database
      const userFoodPreferences = await getUserFoodPreferences();
      
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "generate-recipe",
          data: { 
            title, 
            ingredients,
            userFoodPreferences 
          },
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
