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

export interface GenerateRecipeParams {
  ingredients: string[];
  singleRecipe?: boolean;
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

  const suggestRecipe = async (data: {
    ingredients: string;
    recipeName?: string;
    additionalPreferences?: string;
  }) => {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        "ai-recipe-suggestions",
        {
          body: {
            type: "suggest-recipes",
            data: {
              preferences: `Baby food recipe using: ${data.ingredients}${data.recipeName ? `. Recipe name: ${data.recipeName}` : ''}${data.additionalPreferences ? `. Additional preferences: ${data.additionalPreferences}` : ''}`,
              dietaryRestrictions: "Safe for babies",
              userId: user?.id,
            },
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
        console.error("Error calling baby food recipe suggestion:", error);
        toast.error(`Recipe suggestion failed: ${error.message}`);
        throw error;
      }

      return response.result;
    } catch (error) {
      console.error("Unexpected error in baby food recipe suggestion:", error);
      toast.error(`Recipe suggestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
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
  }) => {
    return makeEdgeFunctionRequest(
      "ai-recipe-suggestions",
      "suggest-meal-for-plan",
      data
    );
  };

  const generateRecipe = async (data: GenerateRecipeParams) => {
    return makeEdgeFunctionRequest(
      "generate-recipe-from-fridge",
      "generate-recipe",
      data
    );
  };

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

  return {
    loading,
    suggestRecipes,
    suggestRecipe,
    analyzeMealPlan,
    suggestMealForPlan,
    generateRecipe,
    enhanceRecipeInstructions,
    generateBabyFood
  };
};

export default useAiRecipes;
