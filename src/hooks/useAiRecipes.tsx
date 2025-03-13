import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Json } from "@/integrations/supabase/types";

interface SuggestRecipesParams {
  preferences?: string;
  dietaryRestrictions?: string;
}

interface SuggestMealParams {
  mealType: "breakfast" | "lunch" | "dinner";
  season?: string;
  additionalPreferences?: string;
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

// Define a type for the preferences object shape
interface UserPreferences {
  food?: UserFoodPreferences;
  [key: string]: any; // Allow other preference categories
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
      if (data?.preferences && 
          typeof data.preferences === 'object' && 
          !Array.isArray(data.preferences)) {
        // Cast to UserPreferences to access the food property
        const userPrefs = data.preferences as UserPreferences;
        return userPrefs.food || null;
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
      
      const { data, error } = await supabase.functions.invoke("generate-recipe-from-fridge", {
        body: {
          ingredients,
          userFoodPreferences
        },
      });

      if (error) throw error;
      
      return data.recipe;
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

  const suggestMealForPlan = async ({ mealType, season, additionalPreferences }: SuggestMealParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user's food preferences from the database
      const userFoodPreferences = await getUserFoodPreferences();
      
      const { data, error } = await supabase.functions.invoke("ai-recipe-suggestions", {
        body: {
          type: "suggest-meal-for-plan",
          data: { 
            mealType,
            season: season || getCurrentSeason(),
            additionalPreferences,
            userFoodPreferences 
          },
        },
      });

      if (error) throw error;
      
      return data.result;
    } catch (err) {
      console.error("Error suggesting meal for plan:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get meal suggestion";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine the current season based on the date
  const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  };

  return {
    suggestRecipes,
    analyzeMealPlan,
    generateRecipe,
    suggestMealForPlan,
    loading,
    error,
  };
};

export default useAiRecipes;
