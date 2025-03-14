
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
              model: aiSettings?.model || "gpt-3.5-turbo",
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
        console.error(`Error calling ${endpoint}:`, error);
        toast.error(`AI request failed: ${error.message}`);
        throw error;
      }

      return response.result;
    } catch (error) {
      console.error(`Unexpected error in ${endpoint}:`, error);
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
  };
};

export default useAiRecipes;
