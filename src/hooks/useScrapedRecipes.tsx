
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./recipes/types";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to scrape recipe using OpenAI
  const scrapeRecipeWithAI = async (url: string): Promise<Partial<RecipeFormData>> => {
    setIsLoading(true);
    
    try {
      console.log("Starting recipe scraping from URL:", url);
      
      // Call scrape-recipe edge function
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: { url }
      });
      
      if (error) {
        console.error("Supabase edge function error:", error);
        throw new Error(error.message || "Failed to scrape recipe");
      }
      
      if (!data) {
        console.error("No data returned from scrape-recipe function");
        throw new Error("No recipe data found");
      }
      
      // Process the scraped recipe data
      console.log("Scraped recipe data:", data);
      
      // Extract multiple images if available
      const extractedImages = Array.isArray(data.images) && data.images.length > 0 ? data.images : 
                             (data.image ? [data.image] : []);
      
      console.log("Extracted images:", extractedImages);
      
      // Format the data for the form
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: extractedImages.length > 0 ? extractedImages[0] : null,
        images: extractedImages,
        time: typeof data.time === 'number' ? data.time : (data.time ? parseInt(data.time.toString()) : 30),
        servings: typeof data.servings === 'number' ? data.servings : (data.servings ? parseInt(data.servings.toString()) : 2),
        difficulty: data.difficulty || "Medium",
        description: data.description || "",
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        instructions: Array.isArray(data.instructions) ? data.instructions : [],
        tags: Array.isArray(data.tags) ? data.tags : []
      };
      
      console.log("Formatted recipe data:", recipeData);
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

  // Fallback to AI parser if the scrape-recipe function fails
  const fallbackToAIParser = async (url: string): Promise<Partial<RecipeFormData>> => {
    try {
      console.log("Falling back to AI recipe parser for URL:", url);
      
      const { data, error } = await supabase.functions.invoke("ai-recipe-parser", {
        body: { url }
      });
      
      if (error) throw error;
      
      if (!data || !data.success || !data.data) {
        throw new Error("AI parser couldn't extract the recipe");
      }
      
      const recipeData = data.data;
      
      return {
        title: recipeData.title || "Untitled Recipe",
        image: recipeData.image || null,
        images: recipeData.image ? [recipeData.image] : [],
        time: typeof recipeData.time === 'number' ? recipeData.time : 30,
        servings: typeof recipeData.servings === 'number' ? recipeData.servings : 2,
        difficulty: recipeData.difficulty || "Medium",
        description: recipeData.description || "",
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : []
      };
    } catch (err) {
      console.error("Fallback AI parser error:", err);
      throw err;
    }
  };

  // Main scrape function that tries both methods
  const scrapeRecipe = async (url: string): Promise<Partial<RecipeFormData>> => {
    try {
      return await scrapeRecipeWithAI(url);
    } catch (error) {
      console.log("Primary scraping failed, trying fallback method");
      try {
        return await fallbackToAIParser(url);
      } catch (fallbackError) {
        console.error("Both scraping methods failed:", fallbackError);
        throw fallbackError;
      }
    }
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
