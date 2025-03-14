
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";
import useAISettings from "./useAISettings";

// Define interfaces for AISettings and UserPreferences
export interface UserPreferences {
  responseStyle?: "concise" | "balanced" | "detailed";
  [key: string]: any;
}

export interface AISettings {
  model?: string;
  temperature?: number;
  promptHistoryEnabled?: boolean;
  useMemory?: boolean;
  userPreferences?: UserPreferences;
}

export const useAiRecipes = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { useAISettingsQuery } = useAISettings();
  const { data: aiSettings } = useAISettingsQuery();

  const makeEdgeFunctionRequest = async (
    endpoint: string,
    type: string,
    data: any
  ) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setLoading(true);

    try {
      const { data: response, error } = await supabase.functions.invoke(
        endpoint,
        {
          body: {
            type,
            data: {
              ...data,
              userId: user.id,
            },
            aiSettings: {
              model: aiSettings?.model || "gpt-4o-mini",
              temperature: aiSettings?.temperature || 0.7,
              promptHistoryEnabled: aiSettings?.promptHistoryEnabled !== false,
              useMemory: aiSettings?.useMemory ?? true,
              userPreferences: {
                responseStyle: aiSettings?.userPreferences?.responseStyle || "balanced",
              },
            },
          },
        }
      );

      if (error) {
        console.error(`Error calling ${endpoint}:`, error);
        toast.error(`AI request failed: ${error.message}`);
        throw error;
      }

      return response.result;
    } catch (error) {
      console.error(`Unexpected error in ${endpoint}:`, error);
      toast.error(`AI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const suggestRecipes = async (data: {
    preferences: string;
    dietaryRestrictions: string;
  }) => {
    return makeEdgeFunctionRequest(
      "ai-recipe-suggestions",
      "suggest-recipes",
      data
    );
  };

  const analyzeMealPlan = async (data: {
    mealPlan: any[];
  }) => {
    return makeEdgeFunctionRequest(
      "ai-recipe-suggestions",
      "analyze-meal-plan",
      data
    );
  };

  const suggestMealForPlan = async (data: {
    mealType: string;
    additionalPreferences?: string;
    season?: string;
  }) => {
    return makeEdgeFunctionRequest(
      "ai-recipe-suggestions",
      "suggest-meal-for-plan",
      {
        ...data,
        season: data.season || getCurrentSeason(),
      }
    );
  };

  // Add the missing generateRecipe function for the fridge page
  const generateRecipe = async (data: {
    title: string;
    ingredients: string[];
  }) => {
    return makeEdgeFunctionRequest(
      "generate-recipe-from-fridge",
      "generate-recipe",
      data
    );
  };

  // Add new generateBabyFood function
  const generateBabyFood = async (data: {
    ingredients: string[];
    babyFoodPreferences: {
      babyAge?: string;
      babyFoodPreferences?: string;
      ingredientsToAvoid?: string;
    };
  }) => {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        "generate-baby-food",
        {
          body: {
            ingredients: data.ingredients,
            babyFoodPreferences: data.babyFoodPreferences,
            userId: user?.id,
            aiSettings: {
              model: aiSettings?.model || "gpt-4o-mini",
              temperature: aiSettings?.temperature || 0.7,
              promptHistoryEnabled: aiSettings?.promptHistoryEnabled !== false,
              userPreferences: {
                responseStyle: aiSettings?.userPreferences?.responseStyle || "balanced",
              },
            },
          },
        }
      );

      if (error) {
        console.error("Error calling generate-baby-food:", error);
        toast.error(`Baby food generation failed: ${error.message}`);
        throw error;
      }

      return response.recipes;
    } catch (error) {
      console.error("Unexpected error in generate-baby-food:", error);
      toast.error(`Baby food generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add the new enhanceRecipeInstructions function
  const enhanceRecipeInstructions = async (data: {
    recipeTitle: string;
    instructions: string[];
    ingredients: string[];
  }) => {
    try {
      return await makeEdgeFunctionRequest(
        "enhance-recipe-instructions",
        "enhance-recipe-instructions",
        data
      );
    } catch (error) {
      console.error("Failed to enhance recipe instructions:", error);
      toast.error("Failed to enhance recipe instructions. Please try again later.");
      // Return empty enhanced instructions to avoid breaking the UI
      return data.instructions.map(step => ({
        step,
        tooltips: []
      }));
    }
  };

  // Helper to determine current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  };

  return {
    loading,
    suggestRecipes,
    analyzeMealPlan,
    suggestMealForPlan,
    generateRecipe,
    enhanceRecipeInstructions,
    generateBabyFood
  };
};

export default useAiRecipes;
