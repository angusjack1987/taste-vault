
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./recipes/types";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to scrape recipe from URL with better error handling and retry logic
  const scrapeRecipe = async (url: string): Promise<Partial<RecipeFormData>> => {
    setIsLoading(true);
    
    try {
      // Check for network connectivity first
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }
      
      console.log("Scraping recipe from URL:", url);
      
      // Call edge function to scrape recipe with detailed logs
      console.log("Calling edge function with URL:", url);
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: { url }
      });
      
      console.log("Edge function response:", { data, error });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to scrape recipe");
      }
      
      if (!data || data.error) {
        console.error("Data error:", data?.error || "No data returned");
        throw new Error(data?.error || "No recipe data found");
      }
      
      // Process the scraped recipe data
      console.log("Scraped recipe data:", data);
      
      // Format the data for the form
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: data.image || null,
        images: Array.isArray(data.images) ? data.images : [],
        time: data.time || 30,
        servings: data.servings || 2,
        difficulty: data.difficulty || "Medium",
        description: data.description || "",
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || []
      };
      
      toast.success("Recipe extracted successfully");
      return recipeData;
    } catch (error) {
      console.error("Error scraping recipe:", error);
      
      // Provide user-friendly error message
      let errorMessage = "Failed to scrape recipe";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || 
                  error.message.includes("Network") ||
                  error.message.includes("connect") ||
                  error.message.includes("offline")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. The website might be taking too long to respond.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a mutation hook for React Query
  const useScrapeRecipeMutation = () => {
    return useMutation({
      mutationFn: scrapeRecipe
    });
  };

  return {
    isLoading,
    useScrapeRecipeMutation
  };
};

export default useScrapedRecipes;
