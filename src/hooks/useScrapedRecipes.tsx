
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase, handleSupabaseRequest } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./recipes/types";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to scrape recipe using OpenAI
  const scrapeRecipeWithAI = async (url: string): Promise<Partial<RecipeFormData>> => {
    setIsLoading(true);
    
    try {
      console.log("Calling scrape-recipe edge function with URL:", url);
      
      // Call scrape-recipe edge function
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: { url }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data received from edge function");
      }
      
      // Process the scraped recipe data
      console.log("Scraped recipe data:", data);
      
      // Extract multiple images if available
      const extractedImages = Array.isArray(data.images) ? data.images : 
                            (data.image ? [data.image] : []);
      
      // Format the data for the form
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: extractedImages.length > 0 ? extractedImages[0] : null,
        images: extractedImages,
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
      toast.error(`Failed to scrape recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function that tries AI parser if the main scraper fails
  const scrapeRecipeWithFallback = async (url: string): Promise<Partial<RecipeFormData>> => {
    try {
      // First try the main scraper
      return await scrapeRecipeWithAI(url);
    } catch (error) {
      console.log("Primary scraper failed, trying ai-recipe-parser as fallback");
      
      try {
        // Call ai-recipe-parser as a fallback
        const { data, error } = await supabase.functions.invoke("ai-recipe-parser", {
          body: { url }
        });
        
        if (error) {
          throw new Error(`Fallback parser error: ${error.message}`);
        }
        
        if (!data || !data.data) {
          throw new Error("No data received from fallback parser");
        }
        
        const parsedData = data.data;
        console.log("Fallback parser data:", parsedData);
        
        // Format the data for the form
        const recipeData: Partial<RecipeFormData> = {
          title: parsedData.title || "Untitled Recipe",
          image: parsedData.image || null,
          images: parsedData.image ? [parsedData.image] : [],
          time: parsedData.time || 30,
          servings: parsedData.servings || 2,
          difficulty: parsedData.difficulty || "Medium",
          description: parsedData.description || "",
          ingredients: parsedData.ingredients || [],
          instructions: parsedData.instructions || [],
          tags: parsedData.tags || []
        };
        
        toast.success("Recipe extracted with fallback parser");
        return recipeData;
      } catch (fallbackError) {
        console.error("Both scrapers failed:", fallbackError);
        toast.error("Unable to extract recipe. Please try a different URL or enter manually.");
        throw fallbackError;
      }
    }
  };

  // Simplified scrape function that uses both methods
  const scrapeRecipe = async (url: string): Promise<Partial<RecipeFormData>> => {
    return scrapeRecipeWithFallback(url);
  };

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
